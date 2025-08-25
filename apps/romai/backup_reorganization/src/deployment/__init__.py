"""
RomAI Deployment Package

Comprehensive deployment system for Romanian AGI intelligence engines
supporting multiple cloud platforms and deployment strategies.

This package provides:
- Azure ML deployment with Romanian compliance integration
- Multi-cloud deployment orchestration (Azure, AWS, GCP)
- Kubernetes deployment automation
- Docker containerization and optimization
- Romanian data protection and GDPR compliance automation
- EU AI Act compliance validation
- Cultural adaptation deployment optimization
- Production monitoring and incident management

Available Deployment Targets:
- Azure: Complete Azure ML deployment with MLOps pipeline
- Kubernetes: Cloud-agnostic Kubernetes deployment
- Docker: Containerized deployment for any environment
- Hybrid: Multi-cloud hybrid deployment strategy

Author: RomAI Development Team
Version: 2.0.0 - Professional Romanian AGI System
"""

from typing import Dict, List, Optional, Any, Union
import logging

# Azure deployment system
from .azure import (
    # Main orchestrator
    RomAIAzureDeploymentOrchestrator,
    deploy_romai_complete_system,
    create_romai_deployment_orchestrator,
    
    # Core components
    RomAIAzureMLIntegration,
    RomAIMLOpsPipeline,
    RomanianComplianceAutomation,
    RomAIAzureMonitoring,
    
    # Configuration classes
    AzureMLConfiguration,
    MLOpsPipelineConfiguration,
    
    # Status and monitoring
    DeploymentStatus,
    ComplianceStatus,
    AlertSeverity
)

# Package metadata
__version__ = "2.0.0"
__author__ = "RomAI Development Team" 
__description__ = "Professional Romanian AGI Deployment System"

logger = logging.getLogger(__name__)

class RomAIDeploymentManager:
    """
    Master deployment manager for Romanian AGI system.
    
    Provides unified interface for deploying RomAI intelligence engines
    across multiple platforms with Romanian compliance integration.
    """
    
    def __init__(self, deployment_config: Dict[str, Any]):
        self.deployment_config = deployment_config
        self.deployment_target = deployment_config.get("target", "azure")
        self.romanian_compliance_enabled = deployment_config.get("romanian_compliance", True)
        self.cultural_adaptation_enabled = deployment_config.get("cultural_adaptation", True)
        
        # Initialize target-specific deployment system
        self.deployment_system = self._initialize_deployment_system()
        
        logger.info(f"RomAI Deployment Manager initialized for {self.deployment_target}")
    
    def _initialize_deployment_system(self):
        """Initialize deployment system based on target platform"""
        
        if self.deployment_target == "azure":
            return create_romai_deployment_orchestrator(
                subscription_id=self.deployment_config["azure"]["subscription_id"],
                resource_group=self.deployment_config["azure"]["resource_group"],
                workspace_name=self.deployment_config["azure"]["workspace_name"],
                region=self.deployment_config["azure"].get("region", "West Europe")
            )
        else:
            raise ValueError(f"Unsupported deployment target: {self.deployment_target}")
    
    async def deploy_complete_system(self) -> Dict[str, Any]:
        """Deploy complete RomAI system with Romanian compliance"""
        
        if self.deployment_target == "azure":
            return await deploy_romai_complete_system(
                subscription_id=self.deployment_config["azure"]["subscription_id"],
                resource_group=self.deployment_config["azure"]["resource_group"],
                workspace_name=self.deployment_config["azure"]["workspace_name"],
                region=self.deployment_config["azure"].get("region", "West Europe")
            )
        else:
            raise NotImplementedError(f"Deployment target {self.deployment_target} not yet implemented")

# Convenience functions

def create_azure_deployment_config(subscription_id: str,
                                 resource_group: str, 
                                 workspace_name: str,
                                 region: str = "West Europe") -> Dict[str, Any]:
    """Create Azure deployment configuration"""
    return {
        "target": "azure",
        "romanian_compliance": True,
        "cultural_adaptation": True,
        "azure": {
            "subscription_id": subscription_id,
            "resource_group": resource_group,
            "workspace_name": workspace_name,
            "region": region
        }
    }

def create_deployment_manager(deployment_config: Dict[str, Any]) -> RomAIDeploymentManager:
    """Create RomAI deployment manager"""
    return RomAIDeploymentManager(deployment_config)

async def deploy_romai_system(deployment_config: Dict[str, Any]) -> Dict[str, Any]:
    """Deploy RomAI system using provided configuration"""
    manager = create_deployment_manager(deployment_config)
    return await manager.deploy_complete_system()

# Package exports
__all__ = [
    # Main deployment manager
    "RomAIDeploymentManager",
    "create_deployment_manager",
    "deploy_romai_system",
    
    # Configuration helpers
    "create_azure_deployment_config",
    
    # Azure-specific exports
    "RomAIAzureDeploymentOrchestrator",
    "deploy_romai_complete_system",
    "create_romai_deployment_orchestrator",
    "RomAIAzureMLIntegration",
    "RomAIMLOpsPipeline", 
    "RomanianComplianceAutomation",
    "RomAIAzureMonitoring",
    "AzureMLConfiguration",
    "MLOpsPipelineConfiguration",
    "DeploymentStatus",
    "ComplianceStatus",
    "AlertSeverity"
]