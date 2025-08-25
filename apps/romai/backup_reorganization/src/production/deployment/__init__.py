"""
RomAI Production Deployment Package Initialization
=================================================

This package provides comprehensive configuration management and deployment
orchestration for RomAI Multi-Domain AGI production environments with
Romanian compliance integration and enterprise-grade security.

Configuration Components:
- RomAIProductionConfigManager: Core configuration management
- ConfigurationItem: Individual configuration settings
- SecretItem: Secure secret management with Azure Key Vault
- FeatureFlag: Dynamic feature control and gradual rollout
- ComplianceConfiguration: Romanian compliance automation

Configuration Features:
- Multi-environment configuration management
- Secure secret management with encryption
- Feature flag system for controlled rollouts
- Configuration validation and deployment
- Environment promotion workflows
- Configuration drift detection
- Automated backup and versioning

Security & Compliance:
- Azure Key Vault integration for secrets
- GDPR, ANSPDCP, EU AI Act compliance
- Configuration audit trail
- Encrypted configuration storage
- Role-based access control
- Romanian data residency requirements

Deployment Integration:
- Kubernetes ConfigMap and Secret management
- Template-based manifest generation
- Blue-green and rolling deployment support
- Configuration validation before deployment
- Automated rollback on configuration errors

Usage:
    from romai.production.deployment import (
        RomAIProductionConfigManager,
        ConfigurationItem,
        FeatureFlag
    )
    
    # Initialize config manager
    config_manager = RomAIProductionConfigManager()
    await config_manager.initialize_integrations()
    
    # Deploy configuration
    result = await config_manager.deploy_configuration(Environment.PRODUCTION)

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_production_config import (
    RomAIProductionConfigManager,
    ConfigurationItem,
    SecretItem,
    FeatureFlag,
    ComplianceConfiguration,
    DeploymentConfiguration,
    Environment,
    ConfigurationType,
    SecretType,
    FeatureFlagState,
    initialize_romai_config_manager
)

# Package exports
__all__ = [
    "RomAIProductionConfigManager",
    "ConfigurationItem",
    "SecretItem",
    "FeatureFlag",
    "ComplianceConfiguration",
    "DeploymentConfiguration",
    "Environment",
    "ConfigurationType", 
    "SecretType",
    "FeatureFlagState",
    "initialize_romai_config_manager"
]

__version__ = "1.0.0" 
__author__ = "RomAI Excellence Team"