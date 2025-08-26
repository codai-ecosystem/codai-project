#!/usr/bin/env python3
"""
RomAI ML Compliance Package
Comprehensive AI safety, EU AI Act compliance, and GDPR data protection
"""

from .eu_ai_act_compliance import (
    EUAIActComplianceFramework,
    create_compliance_framework,
    AISystemRiskLevel,
    ComplianceStatus,
    BiasAssessment,
    TransparencyReport,
    AlgorithmicAuditRecord
)

from .gdpr_data_protection import (
    GDPRDataProtection,
    create_gdpr_protection,
    DataCategory,
    ProcessingPurpose,
    DataSubjectRights,
    PersonalDataIdentification,
    DataProcessingRecord,
    ConsentRecord
)

from .integrated_safety_monitoring import (
    IntegratedSafetyMonitoring,
    create_integrated_safety_monitoring,
    SafetyAlert,
    ComprehensiveSafetyAssessment
)

__version__ = "1.0.0"
__author__ = "RomAI Development Team"
__description__ = "Comprehensive AI compliance and safety monitoring system"

# Main factory function for easy setup
def create_complete_compliance_system(system_name: str = "RomAI") -> IntegratedSafetyMonitoring:
    """
    Create a complete compliance system with EU AI Act, GDPR, and safety monitoring
    
    Args:
        system_name: Name of the AI system to monitor
        
    Returns:
        IntegratedSafetyMonitoring: Complete compliance and safety monitoring system
        
    Example:
        >>> compliance_system = create_complete_compliance_system("MyAI")
        >>> assessment = await compliance_system.comprehensive_safety_assessment(
        ...     "Input text", "AI response", user_id="user123"
        ... )
        >>> print(f"Compliant: {assessment.overall_compliant}")
    """
    return create_integrated_safety_monitoring(system_name)

# Convenience exports
__all__ = [
    # Main systems
    "EUAIActComplianceFramework",
    "GDPRDataProtection", 
    "IntegratedSafetyMonitoring",
    
    # Factory functions
    "create_compliance_framework",
    "create_gdpr_protection",
    "create_integrated_safety_monitoring",
    "create_complete_compliance_system",
    
    # Enums
    "AISystemRiskLevel",
    "ComplianceStatus",
    "DataCategory",
    "ProcessingPurpose", 
    "DataSubjectRights",
    
    # Data classes
    "BiasAssessment",
    "TransparencyReport",
    "AlgorithmicAuditRecord",
    "PersonalDataIdentification",
    "DataProcessingRecord",
    "ConsentRecord",
    "SafetyAlert",
    "ComprehensiveSafetyAssessment"
]