#!/usr/bin/env python3
"""
RomAI LLM Provider Configuration System
Production-ready configuration management for LLM providers

This module provides:
- Secure API key management with encryption
- Provider-specific configuration templates
- Environment-based configuration loading
- Configuration validation and health checks
- Romanian cultural context configuration
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field, asdict
from pathlib import Path
from cryptography.fernet import Fernet
import yaml
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConfigurationError(Exception):
    """Configuration-related errors"""
    pass

@dataclass
class ProviderCredentials:
    """Secure storage for provider credentials"""
    provider_name: str
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    organization_id: Optional[str] = None
    project_id: Optional[str] = None
    additional_headers: Dict[str, str] = field(default_factory=dict)
    encrypted: bool = False

@dataclass
class RomanianContextConfig:
    """Configuration for Romanian cultural context"""
    context_weight: float = 0.8
    cultural_filtering_enabled: bool = True
    authenticity_threshold: float = 0.7
    cultural_templates_path: str = "cultural_templates/"
    traditional_values_emphasis: float = 0.6
    modern_adaptation_level: float = 0.4
    regional_variations: Dict[str, float] = field(default_factory=lambda: {
        "moldova": 0.9,
        "transilvania": 0.8,
        "muntenia": 0.7,
        "oltenia": 0.7,
        "dobrogea": 0.6,
        "banat": 0.6,
        "bucovina": 0.8,
        "maramures": 0.9
    })

@dataclass
class ModelConfiguration:
    """Configuration for specific models"""
    model_id: str
    display_name: str
    max_tokens: int = 4096
    context_length: int = 8192
    temperature_range: tuple = (0.0, 2.0)
    default_temperature: float = 0.7
    top_p_range: tuple = (0.0, 1.0)
    default_top_p: float = 0.9
    frequency_penalty_range: tuple = (-2.0, 2.0)
    presence_penalty_range: tuple = (-2.0, 2.0)
    supports_streaming: bool = True
    supports_function_calling: bool = False
    cost_per_1k_input_tokens: float = 0.0
    cost_per_1k_output_tokens: float = 0.0
    romanian_optimization_available: bool = False

@dataclass
class ProviderConfiguration:
    """Complete provider configuration"""
    provider_name: str
    provider_type: str
    credentials: ProviderCredentials
    models: List[ModelConfiguration] = field(default_factory=list)
    default_model: Optional[str] = None
    rate_limits: Dict[str, int] = field(default_factory=dict)
    timeout_settings: Dict[str, int] = field(default_factory=lambda: {
        "connect_timeout": 30,
        "read_timeout": 60,
        "total_timeout": 120
    })
    retry_config: Dict[str, int] = field(default_factory=lambda: {
        "max_retries": 3,
        "backoff_factor": 2,
        "retry_delay": 1
    })
    health_check_endpoint: Optional[str] = None
    romanian_context_config: RomanianContextConfig = field(default_factory=RomanianContextConfig)
    enabled: bool = True
    priority: int = 1

class LLMConfigurationManager:
    """Main configuration manager for LLM providers"""
    
    def __init__(self, config_path: str = "config/llm_providers.yaml", 
                 encryption_key_path: str = "config/encryption.key"):
        self.config_path = Path(config_path)
        self.encryption_key_path = Path(encryption_key_path)
        self.providers: Dict[str, ProviderConfiguration] = {}
        self.encryption_key = None
        
        # Ensure config directory exists
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize encryption
        self._initialize_encryption()
        
        # Load default configurations
        self._load_default_configurations()
        
        logger.info("✅ LLM Configuration Manager initialized")
    
    def _initialize_encryption(self):
        """Initialize encryption for sensitive data"""
        if self.encryption_key_path.exists():
            with open(self.encryption_key_path, 'rb') as f:
                self.encryption_key = f.read()
        else:
            # Generate new encryption key
            self.encryption_key = Fernet.generate_key()
            with open(self.encryption_key_path, 'wb') as f:
                f.write(self.encryption_key)
            logger.info("🔐 Generated new encryption key")
        
        self.cipher = Fernet(self.encryption_key)
    
    def _load_default_configurations(self):
        """Load default provider configurations"""
        # OpenAI GPT-4 Configuration
        openai_gpt4_models = [
            ModelConfiguration(
                model_id="gpt-4",
                display_name="GPT-4",
                max_tokens=4096,
                context_length=8192,
                cost_per_1k_input_tokens=0.03,
                cost_per_1k_output_tokens=0.06,
                supports_function_calling=True,
                romanian_optimization_available=True
            ),
            ModelConfiguration(
                model_id="gpt-4-turbo",
                display_name="GPT-4 Turbo",
                max_tokens=4096,
                context_length=128000,
                cost_per_1k_input_tokens=0.01,
                cost_per_1k_output_tokens=0.03,
                supports_function_calling=True,
                romanian_optimization_available=True
            )
        ]
        
        openai_config = ProviderConfiguration(
            provider_name="openai",
            provider_type="openai",
            credentials=ProviderCredentials(
                provider_name="openai",
                api_key=os.getenv("OPENAI_API_KEY"),
                api_base="https://api.openai.com/v1"
            ),
            models=openai_gpt4_models,
            default_model="gpt-4-turbo",
            rate_limits={
                "requests_per_minute": 3500,
                "tokens_per_minute": 90000
            },
            health_check_endpoint="https://api.openai.com/v1/models",
            priority=1
        )
        
        # Anthropic Claude Configuration
        claude_models = [
            ModelConfiguration(
                model_id="claude-3-sonnet-20240229",
                display_name="Claude 3 Sonnet",
                max_tokens=4096,
                context_length=200000,
                cost_per_1k_input_tokens=0.003,
                cost_per_1k_output_tokens=0.015,
                supports_streaming=True,
                romanian_optimization_available=True
            ),
            ModelConfiguration(
                model_id="claude-3-opus-20240229",
                display_name="Claude 3 Opus",
                max_tokens=4096,
                context_length=200000,
                cost_per_1k_input_tokens=0.015,
                cost_per_1k_output_tokens=0.075,
                supports_streaming=True,
                romanian_optimization_available=True
            )
        ]
        
        anthropic_config = ProviderConfiguration(
            provider_name="anthropic",
            provider_type="anthropic",
            credentials=ProviderCredentials(
                provider_name="anthropic",
                api_key=os.getenv("ANTHROPIC_API_KEY"),
                api_base="https://api.anthropic.com"
            ),
            models=claude_models,
            default_model="claude-3-sonnet-20240229",
            rate_limits={
                "requests_per_minute": 50,
                "tokens_per_minute": 40000
            },
            health_check_endpoint="https://api.anthropic.com/v1/complete",
            priority=2
        )
        
        # Azure OpenAI Configuration
        azure_openai_config = ProviderConfiguration(
            provider_name="azure_openai",
            provider_type="azure_openai",
            credentials=ProviderCredentials(
                provider_name="azure_openai",
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_base=os.getenv("AZURE_OPENAI_ENDPOINT", "https://your-resource.openai.azure.com/")
            ),
            models=[
                ModelConfiguration(
                    model_id="gpt-4",
                    display_name="Azure GPT-4",
                    max_tokens=4096,
                    context_length=8192,
                    romanian_optimization_available=True
                )
            ],
            default_model="gpt-4",
            rate_limits={
                "requests_per_minute": 120,
                "tokens_per_minute": 10000
            },
            priority=3,
            enabled=bool(os.getenv("AZURE_OPENAI_API_KEY"))
        )
        
        # Store configurations
        self.providers["openai"] = openai_config
        self.providers["anthropic"] = anthropic_config
        self.providers["azure_openai"] = azure_openai_config
        
        logger.info(f"✅ Loaded {len(self.providers)} default provider configurations")
    
    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt API key for secure storage"""
        return self.cipher.encrypt(api_key.encode()).decode()
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key for use"""
        return self.cipher.decrypt(encrypted_key.encode()).decode()
    
    def add_provider(self, config: ProviderConfiguration):
        """Add new provider configuration"""
        # Encrypt API key if provided
        if config.credentials.api_key and not config.credentials.encrypted:
            config.credentials.api_key = self.encrypt_api_key(config.credentials.api_key)
            config.credentials.encrypted = True
        
        self.providers[config.provider_name] = config
        logger.info(f"✅ Added provider configuration: {config.provider_name}")
    
    def get_provider_config(self, provider_name: str) -> Optional[ProviderConfiguration]:
        """Get provider configuration by name"""
        config = self.providers.get(provider_name)
        if config and config.credentials.encrypted and config.credentials.api_key:
            # Decrypt API key for use
            config_copy = self._deep_copy_config(config)
            config_copy.credentials.api_key = self.decrypt_api_key(config.credentials.api_key)
            config_copy.credentials.encrypted = False
            return config_copy
        return config
    
    def _deep_copy_config(self, config: ProviderConfiguration) -> ProviderConfiguration:
        """Create deep copy of configuration"""
        config_dict = asdict(config)
        return ProviderConfiguration(**config_dict)
    
    def get_enabled_providers(self) -> List[ProviderConfiguration]:
        """Get all enabled providers sorted by priority"""
        enabled_providers = [config for config in self.providers.values() if config.enabled]
        return sorted(enabled_providers, key=lambda x: x.priority)
    
    def validate_configuration(self, provider_name: str) -> Dict[str, Any]:
        """Validate provider configuration"""
        validation_result = {
            "valid": False,
            "errors": [],
            "warnings": [],
            "recommendations": []
        }
        
        config = self.providers.get(provider_name)
        if not config:
            validation_result["errors"].append(f"Provider {provider_name} not found")
            return validation_result
        
        # Check credentials
        if not config.credentials.api_key:
            validation_result["errors"].append("API key is required")
        
        if not config.credentials.api_base:
            validation_result["warnings"].append("API base URL not specified")
        
        # Check models
        if not config.models:
            validation_result["errors"].append("No models configured")
        
        if config.default_model and not any(m.model_id == config.default_model for m in config.models):
            validation_result["errors"].append("Default model not found in configured models")
        
        # Check Romanian context configuration
        romanian_config = config.romanian_context_config
        if romanian_config.context_weight < 0.0 or romanian_config.context_weight > 1.0:
            validation_result["errors"].append("Romanian context weight must be between 0.0 and 1.0")
        
        # Check rate limits
        if not config.rate_limits:
            validation_result["warnings"].append("Rate limits not configured - may hit API limits")
        
        # Romanian optimization recommendations
        romanian_optimized_models = [m for m in config.models if m.romanian_optimization_available]
        if not romanian_optimized_models:
            validation_result["recommendations"].append("Consider using models with Romanian optimization support")
        
        validation_result["valid"] = len(validation_result["errors"]) == 0
        return validation_result
    
    async def health_check_provider(self, provider_name: str) -> Dict[str, Any]:
        """Perform health check on provider"""
        import aiohttp
        
        health_result = {
            "provider": provider_name,
            "healthy": False,
            "response_time": 0.0,
            "error": None,
            "details": {}
        }
        
        config = self.get_provider_config(provider_name)
        if not config or not config.enabled:
            health_result["error"] = "Provider not configured or disabled"
            return health_result
        
        if not config.health_check_endpoint:
            health_result["error"] = "No health check endpoint configured"
            return health_result
        
        try:
            start_time = time.time()
            timeout = aiohttp.ClientTimeout(total=config.timeout_settings["total_timeout"])
            
            headers = {}
            if config.credentials.api_key:
                if config.provider_type == "openai":
                    headers["Authorization"] = f"Bearer {config.credentials.api_key}"
                elif config.provider_type == "anthropic":
                    headers["x-api-key"] = config.credentials.api_key
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(config.health_check_endpoint, headers=headers) as response:
                    health_result["response_time"] = time.time() - start_time
                    health_result["healthy"] = response.status < 400
                    health_result["details"] = {
                        "status_code": response.status,
                        "headers": dict(response.headers)
                    }
                    
        except Exception as e:
            health_result["error"] = str(e)
            health_result["response_time"] = time.time() - start_time
        
        return health_result
    
    def save_configuration(self):
        """Save current configuration to file"""
        config_data = {}
        for provider_name, config in self.providers.items():
            config_dict = asdict(config)
            config_data[provider_name] = config_dict
        
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(config_data, f, default_flow_style=False, indent=2)
        
        logger.info(f"💾 Configuration saved to {self.config_path}")
    
    def load_configuration(self):
        """Load configuration from file"""
        if not self.config_path.exists():
            logger.warning(f"Configuration file {self.config_path} not found, using defaults")
            return
        
        try:
            with open(self.config_path, 'r') as f:
                config_data = yaml.safe_load(f)
            
            self.providers.clear()
            for provider_name, provider_data in config_data.items():
                # Reconstruct configuration objects
                credentials_data = provider_data.get('credentials', {})
                credentials = ProviderCredentials(**credentials_data)
                
                models_data = provider_data.get('models', [])
                models = [ModelConfiguration(**model_data) for model_data in models_data]
                
                romanian_config_data = provider_data.get('romanian_context_config', {})
                romanian_config = RomanianContextConfig(**romanian_config_data)
                
                # Remove nested objects from provider_data for main config
                provider_data_clean = provider_data.copy()
                provider_data_clean.pop('credentials', None)
                provider_data_clean.pop('models', None)
                provider_data_clean.pop('romanian_context_config', None)
                
                config = ProviderConfiguration(
                    credentials=credentials,
                    models=models,
                    romanian_context_config=romanian_config,
                    **provider_data_clean
                )
                
                self.providers[provider_name] = config
            
            logger.info(f"✅ Loaded configuration from {self.config_path}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load configuration: {e}")
            raise ConfigurationError(f"Failed to load configuration: {e}")
    
    def get_romanian_cultural_templates(self) -> Dict[str, str]:
        """Get Romanian cultural context templates"""
        templates = {
            "general_romanian": """
Răspunde cu perspectiva culturală românească, valorând:
- Ospitalitatea și căldura umană
- Respectul pentru bătrâni și tradiții
- Importanța familiei și comunității
- Conexiunea cu natura și țara
- Înțelepciunea populară și experiența de viață
            """,
            
            "emotional_romanian": """
Exprimă răspunsul cu sensibilitatea emoțională românească, incluzând:
- Conceptul de "dor" - nostalgia profundă și dragostea
- "Drag" - afecțiunea sinceră și atașamentul
- "Jale" - tristețea profundă și compasiunea
- Capacitatea de a simți intens și autentic
- Exprimarea emoțiilor prin metafore și imagini poetice
            """,
            
            "wisdom_romanian": """
Oferă sfaturi cu înțelepciunea tradițională românească:
- "Omul sfințește locul" - importanța caracterului
- "Unde-i unul nu-i putere" - forța comunității
- "Râde ciob de oală spartă" - umilința și autoironia
- "Cine se scoală de dimineață, departe ajunge" - munca și perseverența
- Înțelepciunea țăranului român și a străbunilor
            """,
            
            "creative_romanian": """
Creează conținut inspirat din bogăția culturală românească:
- Folclorul și poveștile populare (Miorița, Meșterul Manole)
- Literatura clasică (Eminescu, Creangă, Sadoveanu)
- Tradițiile și obiceiurile (Mărțișor, Colinde, Paște)
- Peisajele României (Carpații, Dunărea, câmpiile)
- Arta populară și meșteșugurile tradiționale
            """,
            
            "philosophical_romanian": """
Abordează subiectul cu filozofia românească:
- Gândirea lui Lucian Blaga despre "matricea stilistică"
- Filozofia lui Constantin Noica despre "modelul cultural"
- Emil Cioran și profunzimea existențială românească
- Mircea Eliade și sacralitatea în cultura română
- Sinteza între gândirea tradițională și modernă
            """
        }
        
        return templates
    
    def get_configuration_summary(self) -> Dict[str, Any]:
        """Get comprehensive configuration summary"""
        summary = {
            "total_providers": len(self.providers),
            "enabled_providers": len([p for p in self.providers.values() if p.enabled]),
            "disabled_providers": len([p for p in self.providers.values() if not p.enabled]),
            "total_models": sum(len(p.models) for p in self.providers.values()),
            "romanian_optimized_models": sum(
                len([m for m in p.models if m.romanian_optimization_available]) 
                for p in self.providers.values()
            ),
            "provider_priorities": {
                name: config.priority for name, config in self.providers.items()
            },
            "average_context_weight": sum(
                p.romanian_context_config.context_weight for p in self.providers.values()
            ) / len(self.providers) if self.providers else 0,
            "cultural_filtering_enabled_count": len([
                p for p in self.providers.values() 
                if p.romanian_context_config.cultural_filtering_enabled
            ])
        }
        
        return summary

# Import time for health checks
import time

async def main():
    """Main execution for configuration system testing"""
    config_manager = LLMConfigurationManager()
    
    logger.info("🔧 LLM CONFIGURATION SYSTEM DEMONSTRATION")
    logger.info("=" * 60)
    
    # Test 1: Configuration loading and validation
    logger.info("📋 Test 1: Configuration validation")
    
    for provider_name in config_manager.providers.keys():
        validation = config_manager.validate_configuration(provider_name)
        logger.info(f"   {provider_name}: Valid={validation['valid']}")
        if validation['errors']:
            logger.info(f"     Errors: {len(validation['errors'])}")
        if validation['warnings']:
            logger.info(f"     Warnings: {len(validation['warnings'])}")
        if validation['recommendations']:
            logger.info(f"     Recommendations: {len(validation['recommendations'])}")
    
    # Test 2: Romanian cultural templates
    logger.info("\n🇷🇴 Test 2: Romanian cultural templates")
    
    templates = config_manager.get_romanian_cultural_templates()
    logger.info(f"   Available templates: {len(templates)}")
    for template_name in templates.keys():
        logger.info(f"     - {template_name}")
    
    # Test 3: Configuration summary
    logger.info("\n📊 Test 3: Configuration summary")
    
    summary = config_manager.get_configuration_summary()
    logger.info(f"   Total providers: {summary['total_providers']}")
    logger.info(f"   Enabled providers: {summary['enabled_providers']}")
    logger.info(f"   Total models: {summary['total_models']}")
    logger.info(f"   Romanian optimized models: {summary['romanian_optimized_models']}")
    logger.info(f"   Average cultural context weight: {summary['average_context_weight']:.2f}")
    
    # Test 4: Provider priority order
    logger.info("\n🏆 Test 4: Provider priority order")
    
    enabled_providers = config_manager.get_enabled_providers()
    for i, provider in enumerate(enabled_providers, 1):
        logger.info(f"   {i}. {provider.provider_name} (priority: {provider.priority})")
        if provider.models:
            default_model = next((m for m in provider.models if m.model_id == provider.default_model), provider.models[0])
            logger.info(f"      Default model: {default_model.display_name}")
            logger.info(f"      Romanian optimization: {default_model.romanian_optimization_available}")
    
    # Test 5: Health checks (would require actual API keys)
    logger.info("\n🏥 Test 5: Health check capabilities")
    logger.info("   Note: Actual health checks require valid API keys")
    
    for provider_name, config in config_manager.providers.items():
        if config.health_check_endpoint:
            logger.info(f"   {provider_name}: Health check endpoint configured")
        else:
            logger.info(f"   {provider_name}: No health check endpoint")
    
    # Test 6: Save/load configuration
    logger.info("\n💾 Test 6: Configuration persistence")
    
    try:
        config_manager.save_configuration()
        logger.info("   Configuration saved successfully")
        
        # Test loading
        new_manager = LLMConfigurationManager()
        new_manager.load_configuration()
        logger.info("   Configuration loaded successfully")
        
        if len(new_manager.providers) == len(config_manager.providers):
            logger.info("   ✅ Configuration persistence verified")
        else:
            logger.warning("   ⚠️ Configuration mismatch after reload")
            
    except Exception as e:
        logger.error(f"   ❌ Configuration persistence failed: {e}")
    
    logger.info("\n✅ LLM configuration system demonstration completed!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())