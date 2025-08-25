"""
RomAI Configuration System
"""

class RomAIConfig:
    """Simple configuration for RomAI system"""
    
    def __init__(self):
        # Azure OpenAI Configuration (uppercase attribute names for compatibility)
        self.AZURE_OPENAI_ENDPOINT = "https://swedencentral.api.cognitive.microsoft.com/"
        self.AZURE_OPENAI_API_KEY = "8f9d3fd033c04f5ab6b5886c15f16a2c"  # Working key from environment
        self.AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-4o"
        self.AZURE_OPENAI_API_VERSION = "2024-02-01"
        
        # Lowercase aliases for backward compatibility
        self.azure_openai_endpoint = self.AZURE_OPENAI_ENDPOINT
        self.azure_openai_api_key = self.AZURE_OPENAI_API_KEY
        self.azure_openai_deployment = self.AZURE_OPENAI_DEPLOYMENT_NAME
        self.azure_openai_api_version = self.AZURE_OPENAI_API_VERSION
        
        # System Configuration
        self.max_retries = 3
        self.timeout_seconds = 30.0
        self.log_level = "INFO"
        
        # Romanian Cultural Settings
        self.cultural_depth = "comprehensive"
        self.historical_scope = "full"
        self.regional_coverage = ["Transilvania", "Muntenia", "Moldova", "Oltenia", "Dobrogea"]