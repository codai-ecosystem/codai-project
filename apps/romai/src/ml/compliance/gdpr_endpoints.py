"""
GDPR Compliance Endpoints
========================

FastAPI endpoints for GDPR compliance requirements including:
- Privacy policy and data protection information
- Data subject rights management interface
- Data processing transparency
"""

from fastapi import APIRouter, HTTPException, Depends, Form
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
from enum import Enum

router = APIRouter(prefix="/api/v1", tags=["gdpr-compliance"])

class DataSubjectRightType(str, Enum):
    ACCESS = "access"
    RECTIFICATION = "rectification"
    ERASURE = "erasure"
    RESTRICT_PROCESSING = "restrict_processing"
    DATA_PORTABILITY = "data_portability"
    OBJECT = "object"

class PrivacyPolicy(BaseModel):
    """Complete Privacy Policy Information"""
    policy_version: str = "1.0.0"
    last_updated: datetime = datetime.now()
    data_controller: Dict[str, str] = {
        "name": "RomAI Systems",
        "contact": "privacy@romai-systems.eu",
        "address": "Bucharest, Romania",
        "dpo_contact": "dpo@romai-systems.eu"
    }
    data_processing_purposes: List[Dict[str, str]] = [
        {
            "purpose": "AI System Operation",
            "legal_basis": "Legitimate Interest",
            "description": "Processing user queries for AI reasoning and analysis"
        },
        {
            "purpose": "Service Improvement",
            "legal_basis": "Legitimate Interest",
            "description": "Analyzing usage patterns to improve AI system performance"
        },
        {
            "purpose": "Security and Fraud Prevention",
            "legal_basis": "Legitimate Interest",
            "description": "Monitoring system usage for security and fraud prevention"
        }
    ]
    data_categories: List[str] = [
        "Query content and metadata",
        "Usage analytics and performance metrics",
        "System interaction logs",
        "Error and diagnostic information"
    ]
    data_retention: Dict[str, str] = {
        "query_data": "30 days",
        "analytics_data": "12 months",
        "security_logs": "24 months",
        "diagnostic_data": "6 months"
    }
    third_party_sharing: List[Dict[str, str]] = []
    your_rights: List[str] = [
        "Right to access your personal data",
        "Right to rectify inaccurate personal data",
        "Right to erasure (right to be forgotten)",
        "Right to restrict processing",
        "Right to data portability",
        "Right to object to processing"
    ]

class DataSubjectRequest(BaseModel):
    """Data Subject Rights Request"""
    request_type: DataSubjectRightType
    email: EmailStr
    description: str
    verification_method: str = "email"

class DataSubjectResponse(BaseModel):
    """Data Subject Rights Response"""
    request_id: str
    status: str
    estimated_completion: datetime
    instructions: str

@router.get("/privacy-policy", response_model=PrivacyPolicy)
async def get_privacy_policy():
    """
    Get Complete Privacy Policy
    
    GDPR Article 13/14 - Information to be provided to data subjects
    Provides comprehensive privacy policy and data protection information.
    """
    return PrivacyPolicy()

@router.post("/data-subject-request", response_model=DataSubjectResponse)
async def submit_data_subject_request(request: DataSubjectRequest):
    """
    Submit Data Subject Rights Request
    
    GDPR Chapter III - Rights of the data subject (Articles 15-22)
    Allows data subjects to exercise their rights under GDPR.
    """
    request_id = f"DSR_{int(datetime.now().timestamp())}"
    
    # Calculate estimated completion based on request type
    completion_days = {
        DataSubjectRightType.ACCESS: 30,
        DataSubjectRightType.RECTIFICATION: 7,
        DataSubjectRightType.ERASURE: 7,
        DataSubjectRightType.RESTRICT_PROCESSING: 7,
        DataSubjectRightType.DATA_PORTABILITY: 30,
        DataSubjectRightType.OBJECT: 7
    }
    
    estimated_completion = datetime.now() + timedelta(days=completion_days[request.request_type])
    
    instructions = {
        DataSubjectRightType.ACCESS: "We will provide a copy of all personal data we hold about you within 30 days.",
        DataSubjectRightType.RECTIFICATION: "We will correct any inaccurate personal data within 7 days.",
        DataSubjectRightType.ERASURE: "We will delete your personal data within 7 days, subject to legal obligations.",
        DataSubjectRightType.RESTRICT_PROCESSING: "We will restrict processing of your data within 7 days.",
        DataSubjectRightType.DATA_PORTABILITY: "We will provide your data in a machine-readable format within 30 days.",
        DataSubjectRightType.OBJECT: "We will stop processing your data for the specified purposes within 7 days."
    }
    
    # In production, this would integrate with actual data management systems
    return DataSubjectResponse(
        request_id=request_id,
        status="submitted",
        estimated_completion=estimated_completion,
        instructions=instructions[request.request_type]
    )

@router.get("/data-subject-request/{request_id}")
async def get_data_subject_request_status(request_id: str):
    """
    Get Data Subject Request Status
    
    Allows data subjects to check the status of their rights requests.
    """
    # In production, this would query actual request database
    return {
        "request_id": request_id,
        "status": "in_progress",
        "submitted_date": datetime.now().isoformat(),
        "estimated_completion": (datetime.now() + timedelta(days=7)).isoformat(),
        "progress": "Request received and being processed"
    }

@router.get("/data-processing-records")
async def get_data_processing_records():
    """
    Get Data Processing Records
    
    GDPR Article 30 - Records of processing activities
    Provides transparency about data processing activities.
    """
    return {
        "processing_records": [
            {
                "activity_name": "AI Query Processing",
                "controller": "RomAI Systems",
                "purposes": ["AI system operation", "Service delivery"],
                "categories_of_data_subjects": ["AI system users"],
                "categories_of_personal_data": ["Query content", "Usage metadata"],
                "recipients": [],
                "transfers_to_third_countries": False,
                "retention_periods": "30 days for query data",
                "security_measures": ["Encryption", "Access controls", "Audit logging"]
            },
            {
                "activity_name": "System Analytics",
                "controller": "RomAI Systems", 
                "purposes": ["Service improvement", "Performance optimization"],
                "categories_of_data_subjects": ["AI system users"],
                "categories_of_personal_data": ["Usage patterns", "Performance metrics"],
                "recipients": [],
                "transfers_to_third_countries": False,
                "retention_periods": "12 months for analytics data",
                "security_measures": ["Pseudonymization", "Encryption", "Access controls"]
            }
        ]
    }

@router.get("/consent-management")
async def get_consent_management_info():
    """
    Get Consent Management Information
    
    GDPR Article 7 - Conditions for consent
    Provides information about consent mechanisms and management.
    """
    return {
        "consent_management": {
            "consent_required_for": [
                "Optional analytics and improvement data collection",
                "Marketing communications (if applicable)"
            ],
            "consent_not_required_for": [
                "Core AI system functionality (legitimate interest)",
                "Security monitoring (legitimate interest)",
                "Legal compliance (legal obligation)"
            ],
            "consent_withdrawal": {
                "method": "Contact privacy@romai-systems.eu or use data subject rights interface",
                "effect": "Withdrawal processed within 7 days"
            },
            "consent_records": "Maintained securely with timestamp and proof of consent"
        }
    }

@router.get("/data-protection-impact-assessment")
async def get_dpia_summary():
    """
    Get Data Protection Impact Assessment Summary
    
    GDPR Article 35 - Data protection impact assessment
    Provides summary of DPIA for high-risk processing activities.
    """
    return {
        "dpia_summary": {
            "assessment_date": datetime.now().isoformat(),
            "processing_activity": "AI System Query Processing and Analysis",
            "risk_level": "Medium",
            "necessity_proportionality": {
                "necessity": "Processing necessary for AI system operation and service delivery",
                "proportionality": "Data processing limited to what is necessary for stated purposes"
            },
            "risks_identified": [
                {
                    "risk": "Potential inference of sensitive information from queries",
                    "likelihood": "Low",
                    "impact": "Medium",
                    "mitigation": "Query content anonymization and automatic data deletion"
                },
                {
                    "risk": "Unauthorized access to query data",
                    "likelihood": "Low", 
                    "impact": "High",
                    "mitigation": "Strong encryption, access controls, and audit logging"
                }
            ],
            "safeguards_implemented": [
                "Data minimization principles",
                "Purpose limitation enforcement",
                "Storage limitation with automatic deletion",
                "Security measures (encryption, access controls)",
                "Data subject rights implementation"
            ]
        }
    }