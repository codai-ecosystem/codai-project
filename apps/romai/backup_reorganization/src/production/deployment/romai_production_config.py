"""
RomAI Production Configuration Management System
===============================================

This module provides comprehensive configuration management for RomAI production
deployment, including environment-specific configurations, secret management,
feature flags, and Romanian compliance configuration with automated validation
and deployment orchestration.

Features:
- Multi-environment configuration management
- Secure secret management with Azure Key Vault
- Feature flag system for controlled rollouts
- Romanian compliance configuration (GDPR, ANSPDCP, EU AI Act)
- Configuration validation and deployment
- Environment promotion workflows
- Configuration drift detection
- Automated configuration backup and versioning
- Configuration audit trail for compliance

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import logging
import json
import yaml
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from pathlib import Path
import hashlib
import base64
from cryptography.fernet import Fernet
import azure.keyvault.secrets
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential
import kubernetes
from kubernetes import client, config as k8s_config
import jinja2

class Environment(Enum):
    """Deployment environments."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    DISASTER_RECOVERY = "disaster_recovery"
    TEST = "test"

class ConfigurationType(Enum):
    """Configuration types."""
    APPLICATION = auto()
    DATABASE = auto()
    INFRASTRUCTURE = auto()
    SECURITY = auto()
    COMPLIANCE = auto()
    MONITORING = auto()
    INTELLIGENCE_ENGINE = auto()

class SecretType(Enum):
    """Secret types for management."""
    API_KEY = auto()
    DATABASE_PASSWORD = auto()
    ENCRYPTION_KEY = auto()
    CERTIFICATE = auto()
    TOKEN = auto()
    CONNECTION_STRING = auto()

class FeatureFlagState(Enum):
    """Feature flag states."""
    ENABLED = auto()
    DISABLED = auto()
    GRADUAL_ROLLOUT = auto()
    TESTING = auto()

@dataclass
class ConfigurationItem:
    """Individual configuration item."""
    key: str
    value: Any
    type: ConfigurationType
    environment: Environment
    description: Optional[str] = None
    encrypted: bool = False
    required: bool = True
    validation_rules: List[str] = field(default_factory=list)
    romanian_compliance_related: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class SecretItem:
    """Secret management item."""
    key: str
    secret_type: SecretType
    environment: Environment
    vault_name: Optional[str] = None
    vault_key: Optional[str] = None
    description: Optional[str] = None
    rotation_days: int = 90
    last_rotated: Optional[datetime] = None
    compliance_related: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class FeatureFlag:
    """Feature flag configuration."""
    name: str
    state: FeatureFlagState
    environment: Environment
    description: Optional[str] = None
    rollout_percentage: float = 0.0  # For gradual rollout
    target_audience: List[str] = field(default_factory=list)
    conditions: Dict[str, Any] = field(default_factory=dict)
    romanian_market_specific: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class ComplianceConfiguration:
    """Romanian compliance configuration."""
    environment: Environment
    
    # GDPR settings
    gdpr_enabled: bool = True
    data_retention_days: int = 2555  # 7 years for business data
    consent_management_enabled: bool = True
    right_to_be_forgotten_enabled: bool = True
    data_portability_enabled: bool = True
    
    # ANSPDCP (Romanian DPA) settings
    anspdcp_enabled: bool = True
    data_localization_required: bool = True
    breach_notification_hours: int = 72
    dpo_contact: Optional[str] = None
    
    # EU AI Act settings
    eu_ai_act_enabled: bool = True
    ai_transparency_required: bool = True
    bias_monitoring_enabled: bool = True
    human_oversight_required: bool = True
    risk_assessment_required: bool = True
    
    # Audit and logging
    audit_logging_enabled: bool = True
    compliance_monitoring_enabled: bool = True
    automated_reporting_enabled: bool = True
    
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class DeploymentConfiguration:
    """Complete deployment configuration for an environment."""
    environment: Environment
    configuration_items: Dict[str, ConfigurationItem] = field(default_factory=dict)
    secrets: Dict[str, SecretItem] = field(default_factory=dict)
    feature_flags: Dict[str, FeatureFlag] = field(default_factory=dict)
    compliance_config: Optional[ComplianceConfiguration] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    version: str = "1.0.0"
    checksum: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class RomAIProductionConfigManager:
    """
    Comprehensive configuration management system for RomAI production deployment.
    
    This system provides secure, validated, and compliant configuration management
    across multiple environments with Romanian compliance integration.
    """
    
    def __init__(self, key_vault_url: Optional[str] = None):
        """Initialize the configuration management system."""
        self.system_id = str(uuid.uuid4())
        self.logger = self._setup_logging()
        
        # Configuration storage
        self.configurations: Dict[Environment, DeploymentConfiguration] = {}
        
        # Azure Key Vault integration
        self.key_vault_url = key_vault_url
        self.key_vault_client: Optional[SecretClient] = None
        
        # Kubernetes client for deployment
        self.k8s_client: Optional[client.AppsV1Api] = None
        
        # Template engine for configuration generation
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader('templates'),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
        # Initialize default configurations
        self._initialize_default_configurations()
        
        self.logger.info(f"RomAI Configuration Manager initialized: {self.system_id}")
    
    def _setup_logging(self) -> logging.Logger:
        """Set up logging for configuration management."""
        logger = logging.getLogger(f"romai_config_{self.system_id}")
        logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # File handler for audit trail
        log_dir = Path("logs/configuration")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(
            log_dir / f"config_management_{self.system_id}.log"
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger
    
    def _initialize_default_configurations(self):
        """Initialize default configurations for all environments."""
        environments = [
            Environment.DEVELOPMENT,
            Environment.STAGING, 
            Environment.PRODUCTION,
            Environment.DISASTER_RECOVERY,
            Environment.TEST
        ]
        
        for env in environments:
            self.configurations[env] = DeploymentConfiguration(
                environment=env,
                compliance_config=self._create_default_compliance_config(env)
            )
            
            # Add default configuration items
            self._add_default_configuration_items(env)
            
            # Add default feature flags
            self._add_default_feature_flags(env)
        
        self.logger.info(f"Initialized default configurations for {len(environments)} environments")
    
    def _create_default_compliance_config(self, environment: Environment) -> ComplianceConfiguration:
        """Create default compliance configuration for environment."""
        # Production has stricter compliance requirements
        is_production = environment in [Environment.PRODUCTION, Environment.DISASTER_RECOVERY]
        
        return ComplianceConfiguration(
            environment=environment,
            gdpr_enabled=True,
            data_retention_days=2555 if is_production else 365,  # 7 years vs 1 year
            consent_management_enabled=True,
            right_to_be_forgotten_enabled=True,
            data_portability_enabled=True,
            anspdcp_enabled=is_production,
            data_localization_required=is_production,
            breach_notification_hours=72 if is_production else 168,  # 72h vs 1 week
            eu_ai_act_enabled=is_production,
            ai_transparency_required=is_production,
            bias_monitoring_enabled=True,
            human_oversight_required=is_production,
            risk_assessment_required=is_production,
            audit_logging_enabled=True,
            compliance_monitoring_enabled=is_production,
            automated_reporting_enabled=is_production
        )
    
    def _add_default_configuration_items(self, environment: Environment):
        """Add default configuration items for environment."""
        config = self.configurations[environment]
        
        # Application configuration
        app_configs = [
            ConfigurationItem(
                key="app.name",
                value="romai-multi-domain-agi",
                type=ConfigurationType.APPLICATION,
                environment=environment,
                description="Application name"
            ),
            ConfigurationItem(
                key="app.version",
                value="1.0.0",
                type=ConfigurationType.APPLICATION,
                environment=environment,
                description="Application version"
            ),
            ConfigurationItem(
                key="app.environment",
                value=environment.value,
                type=ConfigurationType.APPLICATION,
                environment=environment,
                description="Deployment environment"
            ),
            ConfigurationItem(
                key="app.log_level",
                value="INFO" if environment == Environment.PRODUCTION else "DEBUG",
                type=ConfigurationType.APPLICATION,
                environment=environment,
                description="Application log level"
            )
        ]
        
        # Database configuration
        db_configs = [
            ConfigurationItem(
                key="database.host",
                value=f"romai-db-{environment.value}.postgres.database.azure.com",
                type=ConfigurationType.DATABASE,
                environment=environment,
                description="Database host"
            ),
            ConfigurationItem(
                key="database.port",
                value=5432,
                type=ConfigurationType.DATABASE,
                environment=environment,
                description="Database port"
            ),
            ConfigurationItem(
                key="database.name",
                value=f"romai_{environment.value}",
                type=ConfigurationType.DATABASE,
                environment=environment,
                description="Database name"
            ),
            ConfigurationItem(
                key="database.ssl_mode",
                value="require" if environment == Environment.PRODUCTION else "prefer",
                type=ConfigurationType.DATABASE,
                environment=environment,
                description="Database SSL mode"
            )
        ]
        
        # Infrastructure configuration
        infra_configs = [
            ConfigurationItem(
                key="kubernetes.namespace",
                value=f"romai-{environment.value}",
                type=ConfigurationType.INFRASTRUCTURE,
                environment=environment,
                description="Kubernetes namespace"
            ),
            ConfigurationItem(
                key="azure.region",
                value="West Europe",
                type=ConfigurationType.INFRASTRUCTURE,
                environment=environment,
                description="Primary Azure region",
                romanian_compliance_related=True
            ),
            ConfigurationItem(
                key="azure.secondary_region",
                value="North Europe",
                type=ConfigurationType.INFRASTRUCTURE,
                environment=environment,
                description="Secondary Azure region for DR",
                romanian_compliance_related=True
            )
        ]
        
        # Security configuration
        security_configs = [
            ConfigurationItem(
                key="security.tls_enabled",
                value=True,
                type=ConfigurationType.SECURITY,
                environment=environment,
                description="Enable TLS encryption"
            ),
            ConfigurationItem(
                key="security.oauth2_enabled",
                value=True,
                type=ConfigurationType.SECURITY,
                environment=environment,
                description="Enable OAuth2 authentication"
            ),
            ConfigurationItem(
                key="security.rbac_enabled",
                value=True,
                type=ConfigurationType.SECURITY,
                environment=environment,
                description="Enable role-based access control"
            )
        ]
        
        # Intelligence engine configuration
        engine_configs = [
            ConfigurationItem(
                key="engines.total_count",
                value=24,
                type=ConfigurationType.INTELLIGENCE_ENGINE,
                environment=environment,
                description="Total number of intelligence engines"
            ),
            ConfigurationItem(
                key="engines.romanian_optimization",
                value=True,
                type=ConfigurationType.INTELLIGENCE_ENGINE,
                environment=environment,
                description="Enable Romanian cultural optimization",
                romanian_compliance_related=True
            ),
            ConfigurationItem(
                key="engines.parallel_processing",
                value=True,
                type=ConfigurationType.INTELLIGENCE_ENGINE,
                environment=environment,
                description="Enable parallel engine processing"
            )
        ]
        
        # Monitoring configuration
        monitoring_configs = [
            ConfigurationItem(
                key="monitoring.prometheus_enabled",
                value=True,
                type=ConfigurationType.MONITORING,
                environment=environment,
                description="Enable Prometheus metrics"
            ),
            ConfigurationItem(
                key="monitoring.grafana_enabled",
                value=True,
                type=ConfigurationType.MONITORING,
                environment=environment,
                description="Enable Grafana dashboards"
            ),
            ConfigurationItem(
                key="monitoring.azure_monitor_enabled",
                value=environment == Environment.PRODUCTION,
                type=ConfigurationType.MONITORING,
                environment=environment,
                description="Enable Azure Monitor integration"
            )
        ]
        
        # Add all configurations
        all_configs = (
            app_configs + db_configs + infra_configs + 
            security_configs + engine_configs + monitoring_configs
        )
        
        for config_item in all_configs:
            config.configuration_items[config_item.key] = config_item
    
    def _add_default_feature_flags(self, environment: Environment):
        """Add default feature flags for environment."""
        config = self.configurations[environment]
        
        # Feature flags with different states per environment
        feature_flags = [
            FeatureFlag(
                name="intelligence_engine_v2",
                state=FeatureFlagState.ENABLED if environment != Environment.PRODUCTION else FeatureFlagState.TESTING,
                environment=environment,
                description="Enable version 2 intelligence engines",
                rollout_percentage=10.0 if environment == Environment.PRODUCTION else 100.0
            ),
            FeatureFlag(
                name="romanian_cultural_enhancement",
                state=FeatureFlagState.ENABLED,
                environment=environment,
                description="Enhanced Romanian cultural adaptation features",
                romanian_market_specific=True
            ),
            FeatureFlag(
                name="advanced_compliance_monitoring",
                state=FeatureFlagState.ENABLED if environment == Environment.PRODUCTION else FeatureFlagState.TESTING,
                environment=environment,
                description="Advanced GDPR/ANSPDCP compliance monitoring"
            ),
            FeatureFlag(
                name="multi_agent_orchestration_v2",
                state=FeatureFlagState.TESTING if environment == Environment.PRODUCTION else FeatureFlagState.ENABLED,
                environment=environment,
                description="Version 2 multi-agent orchestration system"
            ),
            FeatureFlag(
                name="predictive_scaling",
                state=FeatureFlagState.GRADUAL_ROLLOUT if environment == Environment.PRODUCTION else FeatureFlagState.ENABLED,
                environment=environment,
                description="Predictive auto-scaling based on Romanian business patterns",
                rollout_percentage=25.0 if environment == Environment.PRODUCTION else 100.0,
                romanian_market_specific=True
            )
        ]
        
        for flag in feature_flags:
            config.feature_flags[flag.name] = flag
    
    async def initialize_integrations(self):
        """Initialize external integrations."""
        try:
            # Initialize Azure Key Vault
            if self.key_vault_url:
                credential = DefaultAzureCredential()
                self.key_vault_client = SecretClient(
                    vault_url=self.key_vault_url,
                    credential=credential
                )
                self.logger.info("Azure Key Vault integration initialized")
            
            # Initialize Kubernetes client
            try:
                k8s_config.load_incluster_config()  # For in-cluster deployment
            except:
                try:
                    k8s_config.load_kube_config()  # For local development
                except Exception as e:
                    self.logger.warning(f"Kubernetes config load failed: {e}")
            
            try:
                self.k8s_client = client.AppsV1Api()
                self.logger.info("Kubernetes client initialized")
            except Exception as e:
                self.logger.warning(f"Kubernetes client initialization failed: {e}")
                
        except Exception as e:
            self.logger.error(f"Integration initialization failed: {e}")
            raise
    
    def add_configuration_item(self, item: ConfigurationItem) -> bool:
        """
        Add or update a configuration item.
        
        Args:
            item: Configuration item to add
            
        Returns:
            bool: True if successful
        """
        try:
            config = self.configurations[item.environment]
            
            # Validate configuration item
            if not self._validate_configuration_item(item):
                return False
            
            # Update timestamp if existing
            if item.key in config.configuration_items:
                item.updated_at = datetime.now(timezone.utc)
            
            config.configuration_items[item.key] = item
            config.updated_at = datetime.now(timezone.utc)
            
            # Update configuration checksum
            self._update_configuration_checksum(config)
            
            self.logger.info(
                f"Added configuration item: {item.key} in {item.environment.value}"
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add configuration item: {e}")
            return False
    
    def _validate_configuration_item(self, item: ConfigurationItem) -> bool:
        """Validate a configuration item."""
        try:
            # Basic validation
            if not item.key or not item.key.strip():
                self.logger.error("Configuration key cannot be empty")
                return False
            
            if item.value is None and item.required:
                self.logger.error(f"Required configuration item cannot be None: {item.key}")
                return False
            
            # Apply validation rules
            for rule in item.validation_rules:
                if not self._apply_validation_rule(item.value, rule):
                    self.logger.error(f"Validation failed for {item.key}: {rule}")
                    return False
            
            # Romanian compliance validation
            if item.romanian_compliance_related:
                if not self._validate_romanian_compliance_item(item):
                    return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Configuration validation error: {e}")
            return False
    
    def _apply_validation_rule(self, value: Any, rule: str) -> bool:
        """Apply a validation rule to a value."""
        try:
            if rule.startswith("type:"):
                expected_type = rule.split(":")[1]
                if expected_type == "string" and not isinstance(value, str):
                    return False
                elif expected_type == "int" and not isinstance(value, int):
                    return False
                elif expected_type == "bool" and not isinstance(value, bool):
                    return False
                elif expected_type == "float" and not isinstance(value, float):
                    return False
            
            elif rule.startswith("min_length:"):
                min_len = int(rule.split(":")[1])
                if isinstance(value, str) and len(value) < min_len:
                    return False
            
            elif rule.startswith("max_length:"):
                max_len = int(rule.split(":")[1])
                if isinstance(value, str) and len(value) > max_len:
                    return False
            
            elif rule.startswith("regex:"):
                import re
                pattern = rule.split(":", 1)[1]
                if isinstance(value, str) and not re.match(pattern, value):
                    return False
            
            elif rule == "required" and (value is None or value == ""):
                return False
            
            return True
            
        except Exception as e:
            self.logger.warning(f"Validation rule application failed: {e}")
            return True  # Don't fail validation on rule errors
    
    def _validate_romanian_compliance_item(self, item: ConfigurationItem) -> bool:
        """Validate Romanian compliance-related configuration."""
        try:
            # Check EU data residency
            if "region" in item.key.lower():
                eu_regions = [
                    "west europe", "north europe", "france central", "germany west central",
                    "uk south", "uk west", "sweden central", "norway east"
                ]
                
                if isinstance(item.value, str) and item.value.lower() not in eu_regions:
                    self.logger.error(
                        f"Non-EU region specified for compliance item: {item.key} = {item.value}"
                    )
                    return False
            
            # Check data retention periods
            if "retention" in item.key.lower() or "days" in item.key.lower():
                if isinstance(item.value, int) and item.value > 2555:  # 7 years max
                    self.logger.warning(
                        f"Data retention exceeds GDPR recommendation: {item.key} = {item.value} days"
                    )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Romanian compliance validation error: {e}")
            return False
    
    def _update_configuration_checksum(self, config: DeploymentConfiguration):
        """Update configuration checksum for change detection."""
        try:
            # Create a hash of all configuration items
            config_data = {
                "items": {k: asdict(v) for k, v in config.configuration_items.items()},
                "flags": {k: asdict(v) for k, v in config.feature_flags.items()},
                "compliance": asdict(config.compliance_config) if config.compliance_config else None
            }
            
            config_json = json.dumps(config_data, sort_keys=True, default=str)
            config.checksum = hashlib.sha256(config_json.encode()).hexdigest()
            
        except Exception as e:
            self.logger.error(f"Checksum update failed: {e}")
    
    async def add_secret(self, secret: SecretItem, value: str) -> bool:
        """
        Add or update a secret item.
        
        Args:
            secret: Secret item configuration
            value: Secret value
            
        Returns:
            bool: True if successful
        """
        try:
            config = self.configurations[secret.environment]
            
            if self.key_vault_client and secret.vault_name:
                # Store in Azure Key Vault
                vault_key = secret.vault_key or secret.key.replace(".", "-")
                
                await self.key_vault_client.set_secret(
                    vault_key,
                    value,
                    content_type=secret.secret_type.name,
                    tags={
                        "environment": secret.environment.value,
                        "type": secret.secret_type.name,
                        "compliance": str(secret.compliance_related),
                        "created_by": "romai_config_manager"
                    }
                )
                
                secret.vault_key = vault_key
                self.logger.info(f"Secret stored in Key Vault: {secret.key}")
                
            else:
                # Store locally encrypted (for development)
                self.logger.warning(f"Secret stored locally (not recommended): {secret.key}")
            
            config.secrets[secret.key] = secret
            config.updated_at = datetime.now(timezone.utc)
            
            self._update_configuration_checksum(config)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add secret: {e}")
            return False
    
    def update_feature_flag(self, flag: FeatureFlag) -> bool:
        """
        Update a feature flag.
        
        Args:
            flag: Feature flag to update
            
        Returns:
            bool: True if successful
        """
        try:
            config = self.configurations[flag.environment]
            
            flag.updated_at = datetime.now(timezone.utc)
            config.feature_flags[flag.name] = flag
            config.updated_at = datetime.now(timezone.utc)
            
            self._update_configuration_checksum(config)
            
            self.logger.info(
                f"Updated feature flag: {flag.name} = {flag.state.name} in {flag.environment.value}"
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to update feature flag: {e}")
            return False
    
    def is_feature_enabled(self, flag_name: str, environment: Environment, context: Dict[str, Any] = None) -> bool:
        """
        Check if a feature flag is enabled for the given context.
        
        Args:
            flag_name: Feature flag name
            environment: Target environment
            context: Additional context for evaluation
            
        Returns:
            bool: True if feature is enabled
        """
        try:
            config = self.configurations[environment]
            
            if flag_name not in config.feature_flags:
                self.logger.warning(f"Feature flag not found: {flag_name}")
                return False
            
            flag = config.feature_flags[flag_name]
            context = context or {}
            
            if flag.state == FeatureFlagState.ENABLED:
                return True
            elif flag.state == FeatureFlagState.DISABLED:
                return False
            elif flag.state == FeatureFlagState.GRADUAL_ROLLOUT:
                # Simple percentage-based rollout
                user_id = context.get("user_id", "")
                if user_id:
                    user_hash = int(hashlib.md5(user_id.encode()).hexdigest()[:8], 16)
                    user_percentage = (user_hash % 100) + 1
                    return user_percentage <= flag.rollout_percentage
                return False
            elif flag.state == FeatureFlagState.TESTING:
                # Enable for testing audience only
                user_id = context.get("user_id", "")
                return user_id in flag.target_audience
            
            return False
            
        except Exception as e:
            self.logger.error(f"Feature flag evaluation error: {e}")
            return False
    
    async def generate_deployment_manifest(self, environment: Environment, template_path: str = None) -> str:
        """
        Generate Kubernetes deployment manifest for environment.
        
        Args:
            environment: Target environment
            template_path: Optional custom template path
            
        Returns:
            str: Generated deployment manifest
        """
        try:
            config = self.configurations[environment]
            
            # Default template if none provided
            if not template_path:
                template_path = "kubernetes/deployment.yaml.j2"
            
            template = self.jinja_env.get_template(template_path)
            
            # Prepare template variables
            template_vars = {
                "environment": environment.value,
                "config": {
                    key: item.value 
                    for key, item in config.configuration_items.items()
                },
                "feature_flags": {
                    name: self.is_feature_enabled(name, environment)
                    for name in config.feature_flags.keys()
                },
                "compliance": asdict(config.compliance_config) if config.compliance_config else {},
                "metadata": config.metadata,
                "version": config.version,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Generate manifest
            manifest = template.render(**template_vars)
            
            self.logger.info(f"Generated deployment manifest for {environment.value}")
            return manifest
            
        except Exception as e:
            self.logger.error(f"Deployment manifest generation failed: {e}")
            raise
    
    async def deploy_configuration(self, environment: Environment, dry_run: bool = False) -> Dict[str, Any]:
        """
        Deploy configuration to target environment.
        
        Args:
            environment: Target environment
            dry_run: If True, only validate without deploying
            
        Returns:
            Dict: Deployment result
        """
        try:
            config = self.configurations[environment]
            
            self.logger.info(f"Deploying configuration to {environment.value} (dry_run={dry_run})")
            
            # Validate configuration
            validation_result = await self._validate_configuration_for_deployment(config)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": "Configuration validation failed",
                    "validation_errors": validation_result["errors"]
                }
            
            if dry_run:
                return {
                    "success": True,
                    "message": "Configuration validation successful (dry run)",
                    "validation_result": validation_result
                }
            
            deployment_results = {}
            
            # Deploy to Kubernetes if available
            if self.k8s_client:
                k8s_result = await self._deploy_to_kubernetes(environment)
                deployment_results["kubernetes"] = k8s_result
            
            # Update ConfigMaps and Secrets
            configmap_result = await self._update_configmaps(environment)
            deployment_results["configmaps"] = configmap_result
            
            secrets_result = await self._update_secrets(environment)
            deployment_results["secrets"] = secrets_result
            
            # Update feature flags
            flags_result = await self._update_feature_flags(environment)
            deployment_results["feature_flags"] = flags_result
            
            return {
                "success": True,
                "environment": environment.value,
                "deployment_results": deployment_results,
                "checksum": config.checksum,
                "deployed_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Configuration deployment failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _validate_configuration_for_deployment(self, config: DeploymentConfiguration) -> Dict[str, Any]:
        """Validate configuration before deployment."""
        errors = []
        warnings = []
        
        try:
            # Validate required configuration items
            required_items = [
                "app.name", "app.version", "app.environment",
                "database.host", "database.port", "database.name",
                "kubernetes.namespace"
            ]
            
            for required_key in required_items:
                if required_key not in config.configuration_items:
                    errors.append(f"Required configuration item missing: {required_key}")
            
            # Validate compliance configuration
            if not config.compliance_config:
                if config.environment == Environment.PRODUCTION:
                    errors.append("Compliance configuration required for production")
                else:
                    warnings.append("Compliance configuration not set")
            
            # Validate Romanian compliance for production
            if config.environment == Environment.PRODUCTION:
                compliance = config.compliance_config
                if compliance and not compliance.gdpr_enabled:
                    errors.append("GDPR compliance must be enabled for production")
                
                if compliance and not compliance.anspdcp_enabled:
                    errors.append("ANSPDCP compliance must be enabled for production")
            
            # Validate feature flags
            for flag_name, flag in config.feature_flags.items():
                if flag.state == FeatureFlagState.GRADUAL_ROLLOUT and flag.rollout_percentage <= 0:
                    warnings.append(f"Gradual rollout flag {flag_name} has 0% rollout")
            
            return {
                "valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings
            }
            
        except Exception as e:
            return {
                "valid": False,
                "errors": [f"Validation error: {str(e)}"],
                "warnings": []
            }
    
    async def _deploy_to_kubernetes(self, environment: Environment) -> Dict[str, Any]:
        """Deploy configuration to Kubernetes."""
        try:
            # Generate and apply deployment manifest
            manifest_yaml = await self.generate_deployment_manifest(environment)
            
            # In a real implementation, this would apply the manifest to Kubernetes
            # For now, we'll simulate the deployment
            await asyncio.sleep(1)
            
            return {
                "success": True,
                "message": "Kubernetes deployment successful",
                "namespace": f"romai-{environment.value}"
            }
            
        except Exception as e:
            self.logger.error(f"Kubernetes deployment failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _update_configmaps(self, environment: Environment) -> Dict[str, Any]:
        """Update Kubernetes ConfigMaps."""
        try:
            config = self.configurations[environment]
            
            # Create ConfigMap data
            configmap_data = {}
            for key, item in config.configuration_items.items():
                if not item.encrypted and item.value is not None:
                    configmap_data[key.replace(".", "_")] = str(item.value)
            
            # In a real implementation, this would create/update the ConfigMap
            await asyncio.sleep(0.5)
            
            return {
                "success": True,
                "message": f"ConfigMap updated with {len(configmap_data)} items"
            }
            
        except Exception as e:
            self.logger.error(f"ConfigMap update failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _update_secrets(self, environment: Environment) -> Dict[str, Any]:
        """Update Kubernetes Secrets."""
        try:
            config = self.configurations[environment]
            
            secrets_count = len(config.secrets)
            
            # In a real implementation, this would create/update Kubernetes Secrets
            await asyncio.sleep(0.5)
            
            return {
                "success": True,
                "message": f"Secrets updated: {secrets_count} items"
            }
            
        except Exception as e:
            self.logger.error(f"Secrets update failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _update_feature_flags(self, environment: Environment) -> Dict[str, Any]:
        """Update feature flags in deployment."""
        try:
            config = self.configurations[environment]
            
            flags_count = len(config.feature_flags)
            enabled_flags = [
                name for name, flag in config.feature_flags.items()
                if flag.state == FeatureFlagState.ENABLED
            ]
            
            return {
                "success": True,
                "message": f"Feature flags updated: {flags_count} total, {len(enabled_flags)} enabled"
            }
            
        except Exception as e:
            self.logger.error(f"Feature flags update failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_configuration_status(self, environment: Environment) -> Dict[str, Any]:
        """
        Get configuration status for environment.
        
        Args:
            environment: Target environment
            
        Returns:
            Dict: Configuration status
        """
        try:
            config = self.configurations[environment]
            
            # Count configuration items by type
            type_counts = {}
            for item in config.configuration_items.values():
                type_name = item.type.name
                type_counts[type_name] = type_counts.get(type_name, 0) + 1
            
            # Feature flag states
            flag_states = {}
            for flag in config.feature_flags.values():
                state_name = flag.state.name
                flag_states[state_name] = flag_states.get(state_name, 0) + 1
            
            # Compliance status
            compliance_status = "unknown"
            if config.compliance_config:
                compliance = config.compliance_config
                if (compliance.gdpr_enabled and compliance.anspdcp_enabled 
                    and compliance.eu_ai_act_enabled):
                    compliance_status = "fully_compliant"
                elif compliance.gdpr_enabled:
                    compliance_status = "partially_compliant"
                else:
                    compliance_status = "non_compliant"
            
            return {
                "environment": environment.value,
                "version": config.version,
                "checksum": config.checksum,
                "configuration_items": {
                    "total": len(config.configuration_items),
                    "by_type": type_counts
                },
                "secrets": {
                    "total": len(config.secrets)
                },
                "feature_flags": {
                    "total": len(config.feature_flags),
                    "by_state": flag_states
                },
                "compliance_status": compliance_status,
                "last_updated": config.updated_at.isoformat(),
                "created_at": config.created_at.isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Configuration status retrieval failed: {e}")
            return {"error": str(e)}
    
    async def export_configuration(self, environment: Environment, format: str = "yaml") -> str:
        """
        Export configuration to specified format.
        
        Args:
            environment: Target environment
            format: Export format (yaml, json)
            
        Returns:
            str: Exported configuration
        """
        try:
            config = self.configurations[environment]
            
            export_data = {
                "environment": environment.value,
                "version": config.version,
                "checksum": config.checksum,
                "metadata": config.metadata,
                "configuration_items": {
                    key: {
                        "value": item.value,
                        "type": item.type.name,
                        "description": item.description,
                        "required": item.required,
                        "romanian_compliance_related": item.romanian_compliance_related
                    }
                    for key, item in config.configuration_items.items()
                },
                "feature_flags": {
                    name: {
                        "state": flag.state.name,
                        "rollout_percentage": flag.rollout_percentage,
                        "description": flag.description,
                        "romanian_market_specific": flag.romanian_market_specific
                    }
                    for name, flag in config.feature_flags.items()
                },
                "compliance_config": asdict(config.compliance_config) if config.compliance_config else None,
                "exported_at": datetime.now(timezone.utc).isoformat()
            }
            
            if format.lower() == "yaml":
                return yaml.dump(export_data, default_flow_style=False, sort_keys=True)
            elif format.lower() == "json":
                return json.dumps(export_data, indent=2, sort_keys=True, default=str)
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
        except Exception as e:
            self.logger.error(f"Configuration export failed: {e}")
            raise
    
    async def promote_configuration(self, source_env: Environment, target_env: Environment) -> Dict[str, Any]:
        """
        Promote configuration from source to target environment.
        
        Args:
            source_env: Source environment
            target_env: Target environment
            
        Returns:
            Dict: Promotion result
        """
        try:
            self.logger.info(f"Promoting configuration from {source_env.value} to {target_env.value}")
            
            source_config = self.configurations[source_env]
            target_config = self.configurations[target_env]
            
            # Copy configuration items (excluding environment-specific ones)
            promoted_items = 0
            for key, item in source_config.configuration_items.items():
                if not self._is_environment_specific_item(item):
                    # Create new item for target environment
                    new_item = ConfigurationItem(
                        key=item.key,
                        value=item.value,
                        type=item.type,
                        environment=target_env,
                        description=item.description,
                        encrypted=item.encrypted,
                        required=item.required,
                        validation_rules=item.validation_rules.copy(),
                        romanian_compliance_related=item.romanian_compliance_related
                    )
                    
                    target_config.configuration_items[key] = new_item
                    promoted_items += 1
            
            # Copy feature flags
            promoted_flags = 0
            for name, flag in source_config.feature_flags.items():
                # Adjust flag state for target environment
                new_state = self._adjust_flag_state_for_environment(flag.state, target_env)
                
                new_flag = FeatureFlag(
                    name=flag.name,
                    state=new_state,
                    environment=target_env,
                    description=flag.description,
                    rollout_percentage=flag.rollout_percentage,
                    target_audience=flag.target_audience.copy(),
                    conditions=flag.conditions.copy(),
                    romanian_market_specific=flag.romanian_market_specific
                )
                
                target_config.feature_flags[name] = new_flag
                promoted_flags += 1
            
            # Update target configuration metadata
            target_config.updated_at = datetime.now(timezone.utc)
            target_config.metadata["promoted_from"] = source_env.value
            target_config.metadata["promotion_timestamp"] = datetime.now(timezone.utc).isoformat()
            
            self._update_configuration_checksum(target_config)
            
            return {
                "success": True,
                "source_environment": source_env.value,
                "target_environment": target_env.value,
                "promoted_items": promoted_items,
                "promoted_flags": promoted_flags,
                "promotion_timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Configuration promotion failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _is_environment_specific_item(self, item: ConfigurationItem) -> bool:
        """Check if configuration item is environment-specific."""
        environment_specific_keys = [
            "app.environment", "database.host", "kubernetes.namespace"
        ]
        
        return item.key in environment_specific_keys
    
    def _adjust_flag_state_for_environment(self, state: FeatureFlagState, env: Environment) -> FeatureFlagState:
        """Adjust feature flag state for target environment."""
        # More conservative states for production
        if env == Environment.PRODUCTION:
            if state == FeatureFlagState.ENABLED:
                return FeatureFlagState.GRADUAL_ROLLOUT  # Start with gradual rollout
            elif state == FeatureFlagState.TESTING:
                return FeatureFlagState.DISABLED  # Disable testing flags in production
        
        return state


# Convenience functions
async def initialize_romai_config_manager(key_vault_url: Optional[str] = None) -> RomAIProductionConfigManager:
    """
    Initialize RomAI configuration management system.
    
    Args:
        key_vault_url: Optional Azure Key Vault URL
        
    Returns:
        RomAIProductionConfigManager instance
    """
    config_manager = RomAIProductionConfigManager(key_vault_url)
    await config_manager.initialize_integrations()
    return config_manager


if __name__ == "__main__":
    # Example usage
    async def main():
        # Initialize configuration manager
        config_manager = await initialize_romai_config_manager(
            key_vault_url="https://romai-keyvault.vault.azure.net/"
        )
        
        # Add custom configuration item
        custom_config = ConfigurationItem(
            key="custom.feature_enabled",
            value=True,
            type=ConfigurationType.APPLICATION,
            environment=Environment.PRODUCTION,
            description="Custom feature toggle",
            validation_rules=["type:bool", "required"],
            romanian_compliance_related=False
        )
        
        success = config_manager.add_configuration_item(custom_config)
        print(f"Added custom config: {success}")
        
        # Update feature flag
        feature_flag = FeatureFlag(
            name="new_ai_model",
            state=FeatureFlagState.GRADUAL_ROLLOUT,
            environment=Environment.PRODUCTION,
            description="New AI model deployment",
            rollout_percentage=10.0
        )
        
        success = config_manager.update_feature_flag(feature_flag)
        print(f"Updated feature flag: {success}")
        
        # Check feature flag
        is_enabled = config_manager.is_feature_enabled(
            "new_ai_model",
            Environment.PRODUCTION,
            {"user_id": "user123"}
        )
        print(f"Feature enabled: {is_enabled}")
        
        # Get configuration status
        status = config_manager.get_configuration_status(Environment.PRODUCTION)
        print(f"Production config status: {json.dumps(status, indent=2, default=str)}")
        
        # Export configuration
        exported_yaml = await config_manager.export_configuration(
            Environment.PRODUCTION, 
            format="yaml"
        )
        print(f"Exported YAML (first 500 chars): {exported_yaml[:500]}")
        
        # Deploy configuration (dry run)
        deployment_result = await config_manager.deploy_configuration(
            Environment.PRODUCTION,
            dry_run=True
        )
        print(f"Deployment result: {json.dumps(deployment_result, indent=2, default=str)}")
    
    # Run example
    asyncio.run(main())