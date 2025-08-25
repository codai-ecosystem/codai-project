# 🔧 RomAI Enterprise Integration Tools - Main Module
# Production-grade enterprise integration suite

# Import core integration modules
from .erp_integration import initialize_erp_integration, get_erp_integration
from .crm_integration import initialize_crm_integration, get_crm_integration
from .workflow_automation import initialize_workflow_automation, get_workflow_automation

from typing import Dict, Any, Optional
import logging
from datetime import datetime
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RomAIEnterpriseIntegrations:
    """
    🔧 RomAI Enterprise Integration Tools Suite
    
    Comprehensive enterprise integration capabilities:
    - LDAP/Active Directory integration
    - Single Sign-On (SSO) support
    - Backup and disaster recovery
    - Centralized management and monitoring
    """
    
    def __init__(self):
        """Initialize enterprise integrations"""
        self.erp_integration = initialize_erp_integration()
        self.crm_integration = initialize_crm_integration()
        self.workflow_automation = initialize_workflow_automation()
        
        logger.info("RomAI Enterprise Integration Tools initialized")
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check for all integrations"""
        try:
            health_status = {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_status": "healthy",
                "integrations": {}
            }
            
            # ERP health check
            try:
                erp_report = self.erp_integration.generate_erp_report()
                health_status["integrations"]["erp"] = {
                    "status": erp_report.get("health_status", "unknown"),
                    "connections": erp_report.get("connections", {}).get("total", 0),
                    "details": erp_report
                }
            except Exception as e:
                health_status["integrations"]["erp"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["overall_status"] = "degraded"
            
            # CRM health check
            try:
                crm_report = self.crm_integration.generate_crm_report()
                health_status["integrations"]["crm"] = {
                    "status": crm_report.get("health_status", "unknown"),
                    "connections": crm_report.get("connections", {}).get("total", 0),
                    "details": crm_report
                }
            except Exception as e:
                health_status["integrations"]["crm"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["overall_status"] = "degraded"
            
            # Workflow health check
            try:
                workflow_report = self.workflow_automation.generate_workflow_report()
                health_status["integrations"]["workflow"] = {
                    "status": workflow_report.get("health_status", "unknown"),
                    "connections": workflow_report.get("connections", {}).get("total", 0),
                    "details": workflow_report
                }
            except Exception as e:
                health_status["integrations"]["workflow"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["overall_status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_status": "unhealthy",
                "error": str(e)
            }
    
    async def get_integration_status(self) -> Dict[str, Any]:
        """Get detailed status of all integrations"""
        try:
            status = {
                "timestamp": datetime.utcnow().isoformat(),
                "erp": {
                    "configured": len(self.erp_integration.connections) > 0,
                    "connections": len(self.erp_integration.connections),
                    "active_systems": len([c for c in self.erp_integration.connections.values() if c.enabled])
                },
                "crm": {
                    "configured": len(self.crm_integration.connections) > 0,
                    "connections": len(self.crm_integration.connections),
                    "active_systems": len([c for c in self.crm_integration.connections.values() if c.sync_enabled])
                },
                "workflow": {
                    "configured": len(self.workflow_automation.connections) > 0,
                    "connections": len(self.workflow_automation.connections),
                    "workflows": len(self.workflow_automation.workflows),
                    "active_workflows": len([w for w in self.workflow_automation.workflows.values() if w.enabled])
                }
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get integration status: {str(e)}")
            return {"error": str(e)}
    
    def get_erp_integration(self):
        """Get ERP integration instance"""
        return self.erp_integration
    
    def get_crm_integration(self):
        """Get CRM integration instance"""
        return self.crm_integration
    
    def get_workflow_automation(self):
        """Get workflow automation instance"""
        return self.workflow_automation

def create_enterprise_integrations() -> RomAIEnterpriseIntegrations:
    """Create enterprise integrations suite"""
    return RomAIEnterpriseIntegrations()

# Export all integration classes and functions
__all__ = [
    'initialize_erp_integration',
    'get_erp_integration',
    'initialize_crm_integration',
    'get_crm_integration', 
    'initialize_workflow_automation',
    'get_workflow_automation',
    'RomAIEnterpriseIntegrations',
    'create_enterprise_integrations'
]
