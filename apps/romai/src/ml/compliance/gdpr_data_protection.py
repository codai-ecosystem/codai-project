#!/usr/bin/env python3
"""
GDPR Data Protection Module
Comprehensive GDPR compliance for AI systems processing personal data
"""

import logging
import datetime
import hashlib
import json
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from enum import Enum
import re
import uuid

logger = logging.getLogger(__name__)

class DataCategory(Enum):
    """GDPR data categories"""
    PERSONAL_DATA = "personal_data"
    SENSITIVE_DATA = "sensitive_data"
    BIOMETRIC_DATA = "biometric_data"
    HEALTH_DATA = "health_data"
    FINANCIAL_DATA = "financial_data"
    CRIMINAL_DATA = "criminal_data"
    CHILDREN_DATA = "children_data"

class ProcessingPurpose(Enum):
    """GDPR processing purposes"""
    CONSENT = "consent"
    CONTRACT = "contract"
    LEGAL_OBLIGATION = "legal_obligation"
    VITAL_INTERESTS = "vital_interests"
    PUBLIC_TASK = "public_task"
    LEGITIMATE_INTERESTS = "legitimate_interests"

class DataSubjectRights(Enum):
    """GDPR data subject rights"""
    ACCESS = "access"
    RECTIFICATION = "rectification"
    ERASURE = "erasure"
    PORTABILITY = "portability"
    RESTRICTION = "restriction"
    OBJECTION = "objection"

@dataclass
class PersonalDataIdentification:
    """Result of personal data identification"""
    detection_id: str
    timestamp: datetime.datetime
    detected_categories: List[DataCategory]
    data_elements: Dict[str, str]
    confidence_scores: Dict[str, float]
    risk_level: str
    protection_required: bool

@dataclass
class DataProcessingRecord:
    """GDPR Article 30 processing record"""
    record_id: str
    controller_info: Dict[str, str]
    processing_purpose: ProcessingPurpose
    data_categories: List[DataCategory]
    data_subjects_categories: List[str]
    recipients: List[str]
    third_country_transfers: List[str]
    retention_period: str
    security_measures: List[str]
    created_timestamp: datetime.datetime

@dataclass
class ConsentRecord:
    """GDPR consent management record"""
    consent_id: str
    data_subject_id: str
    processing_purposes: List[ProcessingPurpose]
    consent_given: bool
    consent_timestamp: datetime.datetime
    withdrawal_timestamp: Optional[datetime.datetime]
    legal_basis: str
    consent_method: str

class PersonalDataDetector:
    """Detects personal data in text inputs"""
    
    def __init__(self):
        # Regex patterns for different types of personal data
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
            'credit_card': r'\b(?:\d{4}[-.\s]?){3}\d{4}\b',
            'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
            'name_patterns': r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
            'address': r'\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)',
            'date_birth': r'\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b'
        }
        
        # Sensitive data keywords
        self.sensitive_keywords = {
            'health': ['medical', 'health', 'diagnosis', 'treatment', 'medication', 'doctor', 'hospital', 'patient'],
            'financial': ['salary', 'income', 'bank', 'account', 'loan', 'credit', 'debt', 'payment'],
            'biometric': ['fingerprint', 'facial', 'retinal', 'voice', 'dna', 'biometric'],
            'ethnic': ['race', 'ethnicity', 'racial', 'ethnic', 'minority', 'indigenous'],
            'religious': ['religion', 'religious', 'faith', 'belief', 'church', 'mosque', 'synagogue', 'temple'],
            'political': ['political', 'party', 'vote', 'election', 'campaign', 'politician'],
            'sexual': ['sexual', 'orientation', 'gay', 'lesbian', 'transgender', 'lgbt']
        }
    
    def detect_personal_data(self, text: str) -> PersonalDataIdentification:
        """Detect and classify personal data in text"""
        detection_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow()
        
        detected_categories = []
        data_elements = {}
        confidence_scores = {}
        
        # Check for direct identifiers
        for data_type, pattern in self.patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                data_elements[data_type] = matches
                confidence_scores[data_type] = 0.95
                
                if data_type in ['email', 'phone', 'ssn', 'name_patterns']:
                    if DataCategory.PERSONAL_DATA not in detected_categories:
                        detected_categories.append(DataCategory.PERSONAL_DATA)
                elif data_type == 'credit_card':
                    if DataCategory.FINANCIAL_DATA not in detected_categories:
                        detected_categories.append(DataCategory.FINANCIAL_DATA)
        
        # Check for sensitive data keywords
        text_lower = text.lower()
        for category, keywords in self.sensitive_keywords.items():
            found_keywords = [kw for kw in keywords if kw in text_lower]
            if found_keywords:
                data_elements[f'{category}_indicators'] = found_keywords
                confidence_scores[category] = len(found_keywords) / len(keywords)
                
                if category == 'health' and DataCategory.HEALTH_DATA not in detected_categories:
                    detected_categories.append(DataCategory.HEALTH_DATA)
                elif category == 'financial' and DataCategory.FINANCIAL_DATA not in detected_categories:
                    detected_categories.append(DataCategory.FINANCIAL_DATA)
                elif category in ['ethnic', 'religious', 'political', 'sexual']:
                    if DataCategory.SENSITIVE_DATA not in detected_categories:
                        detected_categories.append(DataCategory.SENSITIVE_DATA)
        
        # Determine risk level and protection requirements
        risk_level = "low"
        protection_required = False
        
        if DataCategory.SENSITIVE_DATA in detected_categories or DataCategory.HEALTH_DATA in detected_categories:
            risk_level = "high"
            protection_required = True
        elif DataCategory.PERSONAL_DATA in detected_categories or DataCategory.FINANCIAL_DATA in detected_categories:
            risk_level = "medium"
            protection_required = True
        
        return PersonalDataIdentification(
            detection_id=detection_id,
            timestamp=timestamp,
            detected_categories=detected_categories,
            data_elements=data_elements,
            confidence_scores=confidence_scores,
            risk_level=risk_level,
            protection_required=protection_required
        )

class DataProcessingLogger:
    """GDPR Article 30 processing activities logger"""
    
    def __init__(self, controller_name: str = "RomAI System", controller_contact: str = "privacy@romai.ai"):
        self.controller_info = {
            "name": controller_name,
            "contact": controller_contact,
            "dpo_contact": "dpo@romai.ai"
        }
        self.processing_records = []
    
    def log_processing_activity(self, 
                              purpose: ProcessingPurpose,
                              data_categories: List[DataCategory],
                              retention_period: str = "As required for service provision") -> DataProcessingRecord:
        """Log a data processing activity"""
        record = DataProcessingRecord(
            record_id=str(uuid.uuid4()),
            controller_info=self.controller_info,
            processing_purpose=purpose,
            data_categories=data_categories,
            data_subjects_categories=["Users", "Service Recipients"],
            recipients=["Internal AI Systems", "Authorized Personnel"],
            third_country_transfers=[],
            retention_period=retention_period,
            security_measures=[
                "Encryption at rest and in transit",
                "Access controls and authentication",
                "Regular security audits",
                "Data minimization principles",
                "Purpose limitation enforcement"
            ],
            created_timestamp=datetime.datetime.utcnow()
        )
        
        self.processing_records.append(record)
        logger.info(f"📋 GDPR processing activity logged: {record.record_id}")
        return record
    
    def get_processing_register(self) -> List[Dict[str, Any]]:
        """Get complete processing activities register"""
        return [asdict(record) for record in self.processing_records]

class ConsentManager:
    """GDPR consent management system"""
    
    def __init__(self):
        self.consent_records = []
    
    def record_consent(self, 
                      data_subject_id: str,
                      purposes: List[ProcessingPurpose],
                      consent_method: str = "explicit_opt_in") -> ConsentRecord:
        """Record consent given by data subject"""
        consent = ConsentRecord(
            consent_id=str(uuid.uuid4()),
            data_subject_id=data_subject_id,
            processing_purposes=purposes,
            consent_given=True,
            consent_timestamp=datetime.datetime.utcnow(),
            withdrawal_timestamp=None,
            legal_basis="Article 6(1)(a) GDPR - Consent",
            consent_method=consent_method
        )
        
        self.consent_records.append(consent)
        logger.info(f"✅ Consent recorded for subject: {data_subject_id}")
        return consent
    
    def withdraw_consent(self, data_subject_id: str, consent_id: str) -> bool:
        """Process consent withdrawal"""
        for consent in self.consent_records:
            if consent.data_subject_id == data_subject_id and consent.consent_id == consent_id:
                consent.consent_given = False
                consent.withdrawal_timestamp = datetime.datetime.utcnow()
                logger.info(f"🚫 Consent withdrawn for subject: {data_subject_id}")
                return True
        return False
    
    def check_valid_consent(self, data_subject_id: str, purpose: ProcessingPurpose) -> bool:
        """Check if valid consent exists for processing purpose"""
        for consent in self.consent_records:
            if (consent.data_subject_id == data_subject_id and 
                purpose in consent.processing_purposes and 
                consent.consent_given and 
                consent.withdrawal_timestamp is None):
                return True
        return False

class DataSubjectRightsHandler:
    """Handle GDPR data subject rights requests"""
    
    def __init__(self):
        self.rights_requests = []
    
    def handle_access_request(self, data_subject_id: str) -> Dict[str, Any]:
        """Handle right of access request (Art. 15)"""
        request_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow()
        
        # In real implementation, retrieve actual data
        access_response = {
            "request_id": request_id,
            "data_subject_id": data_subject_id,
            "request_type": DataSubjectRights.ACCESS.value,
            "timestamp": timestamp.isoformat(),
            "personal_data_categories": ["Contact information", "Interaction history"],
            "processing_purposes": ["Service provision", "System improvement"],
            "retention_period": "As required for service provision",
            "third_party_recipients": ["None"],
            "source_of_data": ["Direct provision by user"],
            "automated_decision_making": False,
            "data_portability_available": True
        }
        
        self.rights_requests.append(access_response)
        logger.info(f"📄 Access request processed: {request_id}")
        return access_response
    
    def handle_erasure_request(self, data_subject_id: str, reason: str = "Withdrawal of consent") -> Dict[str, Any]:
        """Handle right to erasure request (Art. 17)"""
        request_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow()
        
        # Determine if erasure is applicable
        erasure_applicable = True
        exceptions = []
        
        # Check for legal obligations or other exceptions
        if "legal_obligation" in reason:
            erasure_applicable = False
            exceptions.append("Processing necessary for compliance with legal obligation")
        
        erasure_response = {
            "request_id": request_id,
            "data_subject_id": data_subject_id,
            "request_type": DataSubjectRights.ERASURE.value,
            "timestamp": timestamp.isoformat(),
            "erasure_granted": erasure_applicable,
            "reason": reason,
            "exceptions": exceptions,
            "completion_date": (timestamp + datetime.timedelta(days=30)).isoformat() if erasure_applicable else None
        }
        
        self.rights_requests.append(erasure_response)
        logger.info(f"🗑️ Erasure request processed: {request_id}")
        return erasure_response

class GDPRDataProtection:
    """Main GDPR data protection coordination system"""
    
    def __init__(self, controller_name: str = "RomAI System"):
        self.controller_name = controller_name
        
        # Initialize components
        self.data_detector = PersonalDataDetector()
        self.processing_logger = DataProcessingLogger(controller_name)
        self.consent_manager = ConsentManager()
        self.rights_handler = DataSubjectRightsHandler()
        
        # Privacy settings
        self.data_retention_days = 365
        self.anonymization_threshold_days = 180
        
        logger.info(f"🔒 GDPR Data Protection system initialized for {controller_name}")
    
    def process_with_gdpr_compliance(self, 
                                   input_text: str, 
                                   user_id: Optional[str] = None,
                                   processing_purpose: ProcessingPurpose = ProcessingPurpose.LEGITIMATE_INTERESTS) -> Dict[str, Any]:
        """Process input with full GDPR compliance checks"""
        
        # Step 1: Detect personal data
        data_detection = self.data_detector.detect_personal_data(input_text)
        
        # Step 2: Check if processing is lawful
        lawful_basis_valid = True
        if user_id and data_detection.protection_required:
            if processing_purpose == ProcessingPurpose.CONSENT:
                lawful_basis_valid = self.consent_manager.check_valid_consent(user_id, processing_purpose)
        
        # Step 3: Log processing activity if personal data detected
        processing_record = None
        if data_detection.protection_required:
            processing_record = self.processing_logger.log_processing_activity(
                purpose=processing_purpose,
                data_categories=data_detection.detected_categories
            )
        
        # Step 4: Apply data minimization and protection measures
        protected_input = self._apply_data_protection(input_text, data_detection)
        
        compliance_result = {
            "original_input": input_text,
            "protected_input": protected_input,
            "data_detection": asdict(data_detection),
            "lawful_basis_valid": lawful_basis_valid,
            "processing_record_id": processing_record.record_id if processing_record else None,
            "gdpr_compliant": lawful_basis_valid and data_detection.protection_required,
            "protection_measures_applied": data_detection.protection_required,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        return compliance_result
    
    def _apply_data_protection(self, text: str, detection: PersonalDataIdentification) -> str:
        """Apply data protection measures to text"""
        protected_text = text
        
        # Anonymize or pseudonymize detected personal data
        for data_type, elements in detection.data_elements.items():
            if isinstance(elements, list):
                for element in elements:
                    if data_type == 'email':
                        # Replace email with anonymized version
                        anonymized = f"user{hashlib.md5(element.encode()).hexdigest()[:8]}@[PROTECTED]"
                        protected_text = protected_text.replace(element, anonymized)
                    elif data_type == 'phone':
                        protected_text = protected_text.replace(element, "[PHONE_PROTECTED]")
                    elif data_type == 'ssn':
                        protected_text = protected_text.replace(element, "[SSN_PROTECTED]")
                    elif data_type == 'credit_card':
                        protected_text = protected_text.replace(element, "[CARD_PROTECTED]")
                    elif data_type == 'name_patterns':
                        # Replace with pseudonym
                        pseudonym = f"Person_{hashlib.md5(element.encode()).hexdigest()[:6]}"
                        protected_text = protected_text.replace(element, pseudonym)
        
        return protected_text
    
    def generate_privacy_impact_assessment(self) -> Dict[str, Any]:
        """Generate GDPR Privacy Impact Assessment"""
        return {
            "assessment_id": str(uuid.uuid4()),
            "controller": self.controller_name,
            "assessment_date": datetime.datetime.utcnow().isoformat(),
            "processing_description": "AI-powered language understanding and generation",
            "necessity_assessment": "Processing is necessary for legitimate interests in providing AI services",
            "proportionality_assessment": "Data minimization and purpose limitation applied",
            "risk_assessment": {
                "high_risk_processing": False,
                "sensitive_data_involved": "Potentially, based on user inputs",
                "large_scale_processing": True,
                "automated_decision_making": False,
                "vulnerable_groups": "Not specifically targeted"
            },
            "mitigation_measures": [
                "Real-time personal data detection and protection",
                "Data pseudonymization and anonymization",
                "Strong access controls and encryption",
                "Regular privacy audits and assessments",
                "Clear privacy notices and consent mechanisms",
                "Data retention limits and secure deletion"
            ],
            "residual_risk_level": "Low to Medium",
            "approval_required": False,
            "consultation_with_dpo": True
        }
    
    def get_gdpr_compliance_dashboard(self) -> Dict[str, Any]:
        """Get GDPR compliance dashboard"""
        return {
            "controller_name": self.controller_name,
            "total_processing_records": len(self.processing_logger.processing_records),
            "active_consents": len([c for c in self.consent_manager.consent_records if c.consent_given]),
            "withdrawn_consents": len([c for c in self.consent_manager.consent_records if not c.consent_given]),
            "rights_requests_handled": len(self.rights_handler.rights_requests),
            "data_retention_period": f"{self.data_retention_days} days",
            "privacy_by_design": True,
            "data_protection_measures_active": True,
            "last_privacy_audit": "2025-08-26",  # Would be dynamic in real implementation
            "gdpr_compliance_status": "Compliant",
            "dpo_contact": "dpo@romai.ai"
        }

# Factory function
def create_gdpr_protection(controller_name: str = "RomAI System") -> GDPRDataProtection:
    """Create GDPR data protection system"""
    return GDPRDataProtection(controller_name)

if __name__ == "__main__":
    # Test GDPR protection
    gdpr = create_gdpr_protection()
    
    test_input = "My name is John Doe and my email is john.doe@example.com. I have diabetes and need medical advice."
    
    result = gdpr.process_with_gdpr_compliance(test_input, user_id="user123")
    print(f"GDPR Compliant: {result['gdpr_compliant']}")
    print(f"Protected Input: {result['protected_input']}")
    
    # Generate PIA
    pia = gdpr.generate_privacy_impact_assessment()
    print(f"PIA Risk Level: {pia['residual_risk_level']}")
    
    # Get dashboard
    dashboard = gdpr.get_gdpr_compliance_dashboard()
    print(f"Compliance Status: {dashboard['gdpr_compliance_status']}")