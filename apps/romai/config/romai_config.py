"""
RomAI Configuration for Azure OpenAI Service
Production-ready environment configuration
"""
import os
from typing import Dict, Any

class RomAIConfig:
    """Configuration manager for RomAI Azure OpenAI integration"""
    
    # Azure OpenAI Service Configuration
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "https://swedencentral.api.cognitive.microsoft.com/")
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "8f9d3fd033c04f5ab6b5886c15f16a2c")
    AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")
    AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
    
    # Context Engineering Configuration
    MAX_CONTEXT_TOKENS = int(os.getenv("MAX_CONTEXT_TOKENS", "8000"))
    MAX_RESPONSE_TOKENS = int(os.getenv("MAX_RESPONSE_TOKENS", "2000"))
    CONVERSATION_MEMORY_LIMIT = int(os.getenv("CONVERSATION_MEMORY_LIMIT", "20"))
    
    # Model Parameters
    DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
    DEFAULT_TOP_P = float(os.getenv("DEFAULT_TOP_P", "0.95"))
    DEFAULT_FREQUENCY_PENALTY = float(os.getenv("DEFAULT_FREQUENCY_PENALTY", "0.1"))
    DEFAULT_PRESENCE_PENALTY = float(os.getenv("DEFAULT_PRESENCE_PENALTY", "0.1"))
    
    # Performance Configuration
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_DELAY = float(os.getenv("RETRY_DELAY", "1.0"))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Security Configuration
    ENABLE_CONTENT_FILTERING = os.getenv("ENABLE_CONTENT_FILTERING", "true").lower() == "true"
    ENABLE_AUDIT_LOGGING = os.getenv("ENABLE_AUDIT_LOGGING", "true").lower() == "true"
    
    @classmethod
    def get_openai_config(cls) -> Dict[str, Any]:
        """Get Azure OpenAI configuration dictionary"""
        return {
            "endpoint": cls.AZURE_OPENAI_ENDPOINT,
            "api_key": cls.AZURE_OPENAI_API_KEY,
            "api_version": cls.AZURE_OPENAI_API_VERSION,
            "deployment_name": cls.AZURE_OPENAI_DEPLOYMENT_NAME
        }
    
    @classmethod
    def get_model_params(cls) -> Dict[str, Any]:
        """Get default model parameters"""
        return {
            "temperature": cls.DEFAULT_TEMPERATURE,
            "top_p": cls.DEFAULT_TOP_P,
            "frequency_penalty": cls.DEFAULT_FREQUENCY_PENALTY,
            "presence_penalty": cls.DEFAULT_PRESENCE_PENALTY,
            "max_tokens": cls.MAX_RESPONSE_TOKENS
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate configuration completeness"""
        required_vars = [
            cls.AZURE_OPENAI_ENDPOINT,
            cls.AZURE_OPENAI_DEPLOYMENT_NAME
        ]
        
        missing_vars = [var for var in required_vars if not var or var.strip() == ""]
        
        if missing_vars:
            print(f"Warning: Missing required configuration: {missing_vars}")
            return False
            
        return True
    
    @classmethod
    def print_config_status(cls):
        """Print current configuration status"""
        print("=== RomAI Azure OpenAI Configuration Status ===")
        print(f"Endpoint: {cls.AZURE_OPENAI_ENDPOINT}")
        print(f"API Version: {cls.AZURE_OPENAI_API_VERSION}")
        print(f"Deployment: {cls.AZURE_OPENAI_DEPLOYMENT_NAME}")
        print(f"API Key: {'*' * 10}{cls.AZURE_OPENAI_API_KEY[-4:] if cls.AZURE_OPENAI_API_KEY else 'Not Set'}")
        print(f"Max Context Tokens: {cls.MAX_CONTEXT_TOKENS}")
        print(f"Max Response Tokens: {cls.MAX_RESPONSE_TOKENS}")
        print(f"Temperature: {cls.DEFAULT_TEMPERATURE}")
        print(f"Configuration Valid: {cls.validate_config()}")
        print("=" * 50)

# Environment setup helper
def setup_environment():
    """Setup environment variables for development"""
    env_vars = {
        "AZURE_OPENAI_ENDPOINT": "https://swedencentral.api.cognitive.microsoft.com/",
        "AZURE_OPENAI_API_KEY": "8f9d3fd033c04f5ab6b5886c15f16a2c",
        "AZURE_OPENAI_API_VERSION": "2024-10-21",
        "AZURE_OPENAI_DEPLOYMENT_NAME": "gpt-4o",
        "MAX_CONTEXT_TOKENS": "8000",
        "MAX_RESPONSE_TOKENS": "2000",
        "DEFAULT_TEMPERATURE": "0.7",
        "LOG_LEVEL": "INFO"
    }
    
    for key, value in env_vars.items():
        if not os.getenv(key):
            os.environ[key] = value
            print(f"Set {key} = {value}")

if __name__ == "__main__":
    setup_environment()
    RomAIConfig.print_config_status()