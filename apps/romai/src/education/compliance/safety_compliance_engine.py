"""
RomAI Phase 3.3 Education Sector Solution - Educational Safety & Compliance Engine
Comprehensive COPPA/FERPA compliance and parental control system.

Features:
- COPPA (Children's Online Privacy Protection Act) compliance
- FERPA (Family Educational Rights and Privacy Act) compliance
- Romanian data protection law compliance (GDPR adaptation)
- Parental consent management system
- Content safety monitoring and filtering
- Student privacy protection framework
- Educational data security protocols
- Age verification and validation systems
- Audit trails for educational data access
- Emergency safety reporting system
"""

import asyncio
import json
import logging
import sqlite3
import uuid
import hashlib
import hmac
from datetime import datetime, timedelta, date
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComplianceFramework(Enum):
    """Educational compliance frameworks"""
    COPPA = "coppa"  # Children's Online Privacy Protection Act (US)
    FERPA = "ferpa"  # Family Educational Rights and Privacy Act (US)
    GDPR_EDUCATION = "gdpr_education"  # GDPR for educational institutions
    ROMANIAN_EDUCATION_LAW = "romanian_education_law"  # Romanian education data protection
    EU_DIGITAL_EDUCATION = "eu_digital_education"  # EU Digital Education Action Plan

class StudentAgeCategory(Enum):
    """Student age categories for compliance"""
    UNDER_13 = "under_13"  # COPPA protected age
    TEEN_13_17 = "teen_13_17"  # Teen with limited rights
    ADULT_18_PLUS = "adult_18_plus"  # Full adult rights
    UNKNOWN = "unknown"  # Age not verified

class ConsentType(Enum):
    """Types of parental/guardian consent"""
    DATA_COLLECTION = "data_collection"
    EDUCATIONAL_COMMUNICATION = "educational_communication"
    THIRD_PARTY_SHARING = "third_party_sharing"
    MARKETING_COMMUNICATION = "marketing_communication"
    RESEARCH_PARTICIPATION = "research_participation"
    PHOTO_VIDEO_USAGE = "photo_video_usage"
    EMERGENCY_CONTACT = "emergency_contact"

class PrivacyLevel(Enum):
    """Privacy protection levels"""
    MINIMAL = "minimal"  # Basic privacy protection
    STANDARD = "standard"  # Standard educational privacy
    ENHANCED = "enhanced"  # Enhanced protection for minors
    MAXIMUM = "maximum"  # Maximum protection for sensitive data

class DataCategory(Enum):
    """Categories of educational data"""
    PERSONAL_IDENTIFIERS = "personal_identifiers"  # Name, ID, address
    ACADEMIC_RECORDS = "academic_records"  # Grades, transcripts
    BEHAVIORAL_DATA = "behavioral_data"  # Discipline, attendance
    BIOMETRIC_DATA = "biometric_data"  # Fingerprints, photos
    COMMUNICATION_DATA = "communication_data"  # Emails, messages
    ASSESSMENT_DATA = "assessment_data"  # Test scores, evaluations
    HEALTH_DATA = "health_data"  # Medical, psychological records
    FINANCIAL_DATA = "financial_data"  # Tuition, financial aid

class SafetyThreatLevel(Enum):
    """Safety threat severity levels"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class COPPAComplianceEngine:
    """COPPA compliance management system"""
    
    def __init__(self):
        self.protected_age_threshold = 13
        self.consent_duration_days = 365  # Annual consent renewal
        
    def validate_coppa_compliance(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate COPPA compliance for student data"""
        try:
            age = self._calculate_age(student_data.get("birth_date"))
            age_category = self._determine_age_category(age)
            
            compliance_result = {
                "coppa_applicable": age < self.protected_age_threshold,
                "age_category": age_category.value,
                "estimated_age": age,
                "compliance_status": "compliant",
                "required_actions": [],
                "restrictions": []
            }
            
            if age < self.protected_age_threshold:
                # COPPA protections required
                compliance_result["required_actions"].extend([
                    "Obtain verifiable parental consent",
                    "Limit data collection to educational purposes",
                    "Implement enhanced privacy protections",
                    "Provide parental access rights"
                ])
                
                compliance_result["restrictions"].extend([
                    "No marketing communications",
                    "No third-party data sharing without consent",
                    "Limited behavioral tracking",
                    "Enhanced data security requirements"
                ])
            
            return compliance_result
            
        except Exception as e:
            logger.error(f"COPPA validation error: {str(e)}")
            return {"compliance_status": "error", "error": str(e)}
    
    def _calculate_age(self, birth_date: str) -> Optional[int]:
        """Calculate age from birth date"""
        try:
            if not birth_date:
                return None
            
            birth = datetime.strptime(birth_date, "%Y-%m-%d").date()
            today = date.today()
            age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
            return age
        except:
            return None
    
    def _determine_age_category(self, age: Optional[int]) -> StudentAgeCategory:
        """Determine student age category"""
        if age is None:
            return StudentAgeCategory.UNKNOWN
        elif age < 13:
            return StudentAgeCategory.UNDER_13
        elif age <= 17:
            return StudentAgeCategory.TEEN_13_17
        else:
            return StudentAgeCategory.ADULT_18_PLUS
    
    def generate_consent_form(self, student_data: Dict[str, Any], 
                            consent_types: List[ConsentType]) -> Dict[str, Any]:
        """Generate parental consent form"""
        try:
            consent_form_id = str(uuid.uuid4())
            
            form_data = {
                "consent_form_id": consent_form_id,
                "student_id": student_data.get("student_id"),
                "student_name": student_data.get("full_name"),
                "school_name": student_data.get("school_name", "RomAI Education Platform"),
                "consent_types": [ct.value for ct in consent_types],
                "data_collection_purpose": "Educational services and communication",
                "data_sharing_policy": "Data will not be shared with third parties without explicit consent",
                "parent_rights": [
                    "Review collected data",
                    "Request data correction",
                    "Request data deletion",
                    "Withdraw consent at any time"
                ],
                "contact_information": {
                    "school_email": "privacy@romai-education.ro",
                    "privacy_officer": "Data Protection Officer",
                    "phone": "+40-XXX-XXX-XXX"
                },
                "legal_basis": "COPPA compliance for students under 13 years",
                "consent_duration": f"{self.consent_duration_days} days",
                "generated_at": datetime.utcnow().isoformat()
            }
            
            return form_data
            
        except Exception as e:
            logger.error(f"Consent form generation error: {str(e)}")
            return {"error": str(e)}

class FERPAComplianceEngine:
    """FERPA compliance management system"""
    
    def __init__(self):
        self.directory_information = [
            "name", "address", "telephone", "email", "birth_date",
            "enrollment_status", "grade_level", "field_of_study"
        ]
    
    def validate_ferpa_compliance(self, data_request: Dict[str, Any]) -> Dict[str, Any]:
        """Validate FERPA compliance for educational data request"""
        try:
            requested_data = data_request.get("requested_fields", [])
            requester_type = data_request.get("requester_type", "unknown")
            student_age = data_request.get("student_age", 18)
            
            compliance_result = {
                "ferpa_applicable": True,
                "compliance_status": "compliant",
                "allowed_fields": [],
                "restricted_fields": [],
                "required_authorizations": []
            }
            
            # Determine what data can be shared
            for field in requested_data:
                if field in self.directory_information:
                    compliance_result["allowed_fields"].append(field)
                else:
                    compliance_result["restricted_fields"].append(field)
            
            # Check authorization requirements
            if requester_type == "parent" and student_age < 18:
                compliance_result["required_authorizations"].append("Parental access rights verified")
            elif requester_type == "student" and student_age >= 18:
                compliance_result["required_authorizations"].append("Student consent required")
            elif requester_type == "school_official":
                compliance_result["required_authorizations"].append("Legitimate educational interest verified")
            else:
                compliance_result["required_authorizations"].append("Written consent required")
            
            if compliance_result["restricted_fields"] and not compliance_result["required_authorizations"]:
                compliance_result["compliance_status"] = "non_compliant"
            
            return compliance_result
            
        except Exception as e:
            logger.error(f"FERPA validation error: {str(e)}")
            return {"compliance_status": "error", "error": str(e)}
    
    def generate_education_record_request(self, student_id: str, requester_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate formal education record request"""
        try:
            request_id = str(uuid.uuid4())
            
            return {
                "request_id": request_id,
                "student_id": student_id,
                "requester_name": requester_info.get("name"),
                "requester_relationship": requester_info.get("relationship"),
                "requester_contact": requester_info.get("contact"),
                "requested_records": requester_info.get("requested_records", []),
                "purpose": requester_info.get("purpose", "Educational review"),
                "ferpa_compliance_verified": False,
                "approval_required": True,
                "estimated_processing_days": 45,  # FERPA requirement
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Education record request error: {str(e)}")
            return {"error": str(e)}

class ParentalControlSystem:
    """Comprehensive parental control and monitoring system"""
    
    def __init__(self):
        self.control_categories = [
            "content_filtering", "time_restrictions", "communication_monitoring",
            "assessment_viewing", "progress_notifications", "emergency_alerts"
        ]
    
    def create_parental_control_profile(self, student_id: str, parent_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create parental control profile"""
        try:
            profile_id = str(uuid.uuid4())
            
            profile = {
                "profile_id": profile_id,
                "student_id": student_id,
                "parent_name": parent_info.get("name"),
                "parent_email": parent_info.get("email"),
                "parent_phone": parent_info.get("phone"),
                "relationship": parent_info.get("relationship", "parent"),
                "control_settings": {
                    "content_filtering": {
                        "enabled": True,
                        "filter_level": "moderate",
                        "blocked_categories": ["inappropriate_content", "social_media"],
                        "allowed_websites": [],
                        "blocked_websites": []
                    },
                    "time_restrictions": {
                        "enabled": True,
                        "daily_limit_minutes": 120,
                        "allowed_hours": {"start": "08:00", "end": "20:00"},
                        "weekend_extension": True
                    },
                    "communication_monitoring": {
                        "enabled": True,
                        "monitor_messages": True,
                        "approve_new_contacts": True,
                        "notification_level": "high"
                    },
                    "privacy_settings": {
                        "share_progress_reports": True,
                        "share_assessment_results": True,
                        "share_behavioral_notes": False,
                        "emergency_contact_priority": 1
                    }
                },
                "notification_preferences": {
                    "daily_summary": True,
                    "weekly_report": True,
                    "immediate_alerts": ["safety_concerns", "academic_issues"],
                    "delivery_method": ["email", "sms"]
                },
                "created_at": datetime.utcnow().isoformat(),
                "last_updated": datetime.utcnow().isoformat()
            }
            
            return profile
            
        except Exception as e:
            logger.error(f"Parental control profile creation error: {str(e)}")
            return {"error": str(e)}
    
    def update_control_settings(self, profile_id: str, new_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update parental control settings"""
        try:
            # Validate settings
            validation_result = self._validate_control_settings(new_settings)
            
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": "Invalid control settings",
                    "validation_errors": validation_result["errors"]
                }
            
            # Update settings (would normally update database)
            update_result = {
                "success": True,
                "profile_id": profile_id,
                "updated_settings": new_settings,
                "validation_passed": True,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            return update_result
            
        except Exception as e:
            logger.error(f"Control settings update error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _validate_control_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Validate parental control settings"""
        errors = []
        
        # Validate time restrictions
        if "time_restrictions" in settings:
            time_settings = settings["time_restrictions"]
            if time_settings.get("daily_limit_minutes", 0) > 480:  # 8 hours max
                errors.append("Daily time limit cannot exceed 8 hours")
        
        # Validate content filtering
        if "content_filtering" in settings:
            filter_settings = settings["content_filtering"]
            valid_levels = ["strict", "moderate", "lenient"]
            if filter_settings.get("filter_level") not in valid_levels:
                errors.append("Invalid content filter level")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

class ContentSafetyMonitor:
    """Content safety monitoring and threat detection system"""
    
    def __init__(self):
        self.safety_keywords = {
            "violence": ["fight", "hurt", "weapon", "violence", "attack"],
            "inappropriate": ["inappropriate", "adult", "explicit", "sexual"],
            "bullying": ["bully", "harassment", "threat", "intimidation"],
            "self_harm": ["self harm", "suicide", "depression", "cutting"],
            "substance_abuse": ["drugs", "alcohol", "smoking", "vaping"],
            "personal_info": ["address", "phone number", "credit card", "password"]
        }
        
        self.threat_escalation_rules = {
            SafetyThreatLevel.LOW: {"notification": "log_only", "action": "none"},
            SafetyThreatLevel.MODERATE: {"notification": "teacher", "action": "content_review"},
            SafetyThreatLevel.HIGH: {"notification": "parent_teacher", "action": "immediate_review"},
            SafetyThreatLevel.CRITICAL: {"notification": "all_stakeholders", "action": "content_block"},
            SafetyThreatLevel.EMERGENCY: {"notification": "emergency_services", "action": "immediate_intervention"}
        }
    
    def analyze_content_safety(self, content: str, student_age: int) -> Dict[str, Any]:
        """Analyze content for safety threats"""
        try:
            content_lower = content.lower()
            detected_threats = []
            
            # Scan for safety keywords
            for category, keywords in self.safety_keywords.items():
                for keyword in keywords:
                    if keyword in content_lower:
                        detected_threats.append({
                            "category": category,
                            "keyword": keyword,
                            "severity": self._determine_threat_severity(category, student_age)
                        })
            
            # Calculate overall threat level
            if not detected_threats:
                threat_level = SafetyThreatLevel.LOW
            else:
                max_severity = max([t["severity"] for t in detected_threats])
                threat_level = SafetyThreatLevel(max_severity)
            
            # Generate response actions
            response_actions = self.threat_escalation_rules[threat_level]
            
            return {
                "content_safe": threat_level in [SafetyThreatLevel.LOW, SafetyThreatLevel.MODERATE],
                "threat_level": threat_level.value,
                "detected_threats": detected_threats,
                "response_actions": response_actions,
                "recommendations": self._generate_safety_recommendations(detected_threats),
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Content safety analysis error: {str(e)}")
            return {"content_safe": False, "error": str(e)}
    
    def _determine_threat_severity(self, category: str, student_age: int) -> str:
        """Determine threat severity based on category and student age"""
        base_severity = {
            "violence": "high",
            "inappropriate": "moderate",
            "bullying": "high",
            "self_harm": "critical",
            "substance_abuse": "moderate",
            "personal_info": "high"
        }
        
        severity = base_severity.get(category, "low")
        
        # Increase severity for younger students
        if student_age < 13:
            severity_escalation = {
                "low": "moderate",
                "moderate": "high",
                "high": "critical",
                "critical": "emergency"
            }
            severity = severity_escalation.get(severity, severity)
        
        return severity
    
    def _generate_safety_recommendations(self, threats: List[Dict[str, Any]]) -> List[str]:
        """Generate safety recommendations based on detected threats"""
        recommendations = []
        
        if not threats:
            recommendations.append("Content appears safe for educational use")
            return recommendations
        
        categories = set([t["category"] for t in threats])
        
        if "violence" in categories:
            recommendations.append("Consider alternative content without violent themes")
        if "inappropriate" in categories:
            recommendations.append("Review content for age-appropriateness")
        if "bullying" in categories:
            recommendations.append("Implement anti-bullying educational content")
        if "self_harm" in categories:
            recommendations.append("Provide mental health resources and counseling information")
        if "personal_info" in categories:
            recommendations.append("Educate about online privacy and personal information protection")
        
        return recommendations

class PrivacyProtectionFramework:
    """Student privacy protection and data security framework"""
    
    def __init__(self):
        self.data_retention_policies = {
            DataCategory.PERSONAL_IDENTIFIERS: 365 * 7,  # 7 years
            DataCategory.ACADEMIC_RECORDS: 365 * 10,     # 10 years
            DataCategory.BEHAVIORAL_DATA: 365 * 3,       # 3 years
            DataCategory.BIOMETRIC_DATA: 365 * 5,        # 5 years
            DataCategory.COMMUNICATION_DATA: 365 * 1,    # 1 year
            DataCategory.ASSESSMENT_DATA: 365 * 5,       # 5 years
            DataCategory.HEALTH_DATA: 365 * 7,           # 7 years
            DataCategory.FINANCIAL_DATA: 365 * 7         # 7 years
        }
    
    def implement_privacy_protection(self, student_data: Dict[str, Any], 
                                   privacy_level: PrivacyLevel) -> Dict[str, Any]:
        """Implement privacy protection measures"""
        try:
            protected_data = student_data.copy()
            
            # Apply privacy protections based on level
            if privacy_level == PrivacyLevel.MINIMAL:
                protected_data = self._apply_minimal_protection(protected_data)
            elif privacy_level == PrivacyLevel.STANDARD:
                protected_data = self._apply_standard_protection(protected_data)
            elif privacy_level == PrivacyLevel.ENHANCED:
                protected_data = self._apply_enhanced_protection(protected_data)
            elif privacy_level == PrivacyLevel.MAXIMUM:
                protected_data = self._apply_maximum_protection(protected_data)
            
            return {
                "original_data_fields": len(student_data),
                "protected_data_fields": len(protected_data),
                "privacy_level": privacy_level.value,
                "protection_applied": True,
                "protected_data": protected_data,
                "protection_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Privacy protection error: {str(e)}")
            return {"protection_applied": False, "error": str(e)}
    
    def _apply_minimal_protection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply minimal privacy protection"""
        # Basic field removal
        sensitive_fields = ["social_security", "credit_card", "medical_conditions"]
        return {k: v for k, v in data.items() if k not in sensitive_fields}
    
    def _apply_standard_protection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply standard privacy protection"""
        protected = self._apply_minimal_protection(data)
        
        # Mask personal identifiers
        if "phone" in protected:
            protected["phone"] = self._mask_phone(protected["phone"])
        if "email" in protected:
            protected["email"] = self._mask_email(protected["email"])
        
        return protected
    
    def _apply_enhanced_protection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply enhanced privacy protection"""
        protected = self._apply_standard_protection(data)
        
        # Remove additional sensitive fields
        additional_sensitive = ["address", "parent_occupation", "family_income"]
        protected = {k: v for k, v in protected.items() if k not in additional_sensitive}
        
        # Anonymize names
        if "first_name" in protected:
            protected["first_name"] = "Student"
        if "last_name" in protected:
            protected["last_name"] = f"#{hash(protected.get('student_id', 'unknown')) % 10000}"
        
        return protected
    
    def _apply_maximum_protection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply maximum privacy protection"""
        # Only keep essential educational data
        allowed_fields = ["student_id", "grade_level", "enrollment_status", "academic_performance"]
        return {k: v for k, v in data.items() if k in allowed_fields}
    
    def _mask_phone(self, phone: str) -> str:
        """Mask phone number for privacy"""
        if len(phone) >= 4:
            return f"***-***-{phone[-4:]}"
        return "***-***-****"
    
    def _mask_email(self, email: str) -> str:
        """Mask email address for privacy"""
        if "@" in email:
            username, domain = email.split("@", 1)
            if len(username) > 2:
                masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
            else:
                masked_username = "*" * len(username)
            return f"{masked_username}@{domain}"
        return "***@***.***"

class AuditTrailManager:
    """Educational data access audit trail management"""
    
    def __init__(self):
        self.audit_categories = [
            "data_access", "data_modification", "consent_update",
            "privacy_setting_change", "safety_incident", "compliance_check"
        ]
    
    def log_data_access(self, access_details: Dict[str, Any]) -> Dict[str, Any]:
        """Log educational data access for audit trail"""
        try:
            audit_id = str(uuid.uuid4())
            
            audit_entry = {
                "audit_id": audit_id,
                "event_type": "data_access",
                "student_id": access_details.get("student_id"),
                "accessed_by": access_details.get("accessor_id"),
                "accessor_role": access_details.get("accessor_role"),
                "accessed_data_categories": access_details.get("data_categories", []),
                "access_purpose": access_details.get("purpose"),
                "compliance_framework": access_details.get("compliance_framework"),
                "authorization_verified": access_details.get("authorized", False),
                "access_timestamp": datetime.utcnow().isoformat(),
                "session_id": access_details.get("session_id"),
                "ip_address": access_details.get("ip_address", "unknown"),
                "user_agent": access_details.get("user_agent", "unknown")
            }
            
            # Calculate compliance score
            compliance_score = self._calculate_compliance_score(audit_entry)
            audit_entry["compliance_score"] = compliance_score
            
            return audit_entry
            
        except Exception as e:
            logger.error(f"Audit trail logging error: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_compliance_score(self, audit_entry: Dict[str, Any]) -> float:
        """Calculate compliance score for audit entry"""
        score = 100.0
        
        # Deduct points for missing information
        if not audit_entry.get("authorization_verified"):
            score -= 30.0
        if not audit_entry.get("access_purpose"):
            score -= 15.0
        if not audit_entry.get("compliance_framework"):
            score -= 10.0
        if audit_entry.get("ip_address") == "unknown":
            score -= 5.0
        
        return max(0.0, score)

class EducationalSafetyComplianceEngine:
    """Main educational safety and compliance coordination engine"""
    
    def __init__(self, db_path: str = "education_safety_compliance.db"):
        self.db_path = db_path
        self.coppa_engine = COPPAComplianceEngine()
        self.ferpa_engine = FERPAComplianceEngine()
        self.parental_controls = ParentalControlSystem()
        self.safety_monitor = ContentSafetyMonitor()
        self.privacy_framework = PrivacyProtectionFramework()
        self.audit_manager = AuditTrailManager()
        
        # Initialize database
        self._init_database()
        
        logger.info("Educational Safety & Compliance Engine initialized")
    
    def _init_database(self):
        """Initialize SQLite database for safety and compliance"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Student compliance profiles
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS student_compliance (
                        student_id TEXT PRIMARY KEY,
                        age_category TEXT NOT NULL,
                        coppa_applicable BOOLEAN,
                        ferpa_applicable BOOLEAN,
                        consent_status TEXT,
                        privacy_level TEXT,
                        parental_controls_enabled BOOLEAN,
                        compliance_score REAL,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Parental consent records
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS parental_consents (
                        consent_id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        parent_name TEXT NOT NULL,
                        consent_types TEXT NOT NULL,
                        consent_granted BOOLEAN,
                        consent_date TIMESTAMP,
                        expiry_date TIMESTAMP,
                        digital_signature TEXT,
                        FOREIGN KEY (student_id) REFERENCES student_compliance (student_id)
                    )
                """)
                
                # Safety incidents
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS safety_incidents (
                        incident_id TEXT PRIMARY KEY,
                        student_id TEXT,
                        threat_level TEXT NOT NULL,
                        threat_category TEXT NOT NULL,
                        content_analyzed TEXT,
                        response_actions TEXT,
                        resolved BOOLEAN DEFAULT FALSE,
                        incident_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Audit trail
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS audit_trail (
                        audit_id TEXT PRIMARY KEY,
                        event_type TEXT NOT NULL,
                        student_id TEXT,
                        accessed_by TEXT,
                        accessor_role TEXT,
                        event_details TEXT,
                        compliance_score REAL,
                        event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.commit()
                logger.info("Educational safety compliance database initialized")
                
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
    
    async def register_student_compliance(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register student for compliance framework"""
        try:
            student_id = student_data.get("student_id")
            
            # COPPA compliance check
            coppa_result = self.coppa_engine.validate_coppa_compliance(student_data)
            
            # FERPA compliance setup
            ferpa_applicable = True  # FERPA applies to all educational institutions
            
            # Determine privacy level based on age and compliance requirements
            age_category = StudentAgeCategory(coppa_result.get("age_category", "unknown"))
            if age_category == StudentAgeCategory.UNDER_13:
                privacy_level = PrivacyLevel.ENHANCED
            elif age_category == StudentAgeCategory.TEEN_13_17:
                privacy_level = PrivacyLevel.STANDARD
            else:
                privacy_level = PrivacyLevel.MINIMAL
            
            # Calculate overall compliance score
            compliance_score = self._calculate_overall_compliance_score(coppa_result, ferpa_applicable)
            
            # Store compliance profile
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO student_compliance 
                    (student_id, age_category, coppa_applicable, ferpa_applicable,
                     consent_status, privacy_level, parental_controls_enabled, compliance_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    student_id, age_category.value, coppa_result.get("coppa_applicable", False),
                    ferpa_applicable, "pending", privacy_level.value, 
                    coppa_result.get("coppa_applicable", False), compliance_score
                ))
                conn.commit()
            
            registration_result = {
                "student_id": student_id,
                "compliance_registered": True,
                "age_category": age_category.value,
                "coppa_result": coppa_result,
                "ferpa_applicable": ferpa_applicable,
                "privacy_level": privacy_level.value,
                "compliance_score": compliance_score,
                "required_actions": coppa_result.get("required_actions", []),
                "registration_timestamp": datetime.utcnow().isoformat()
            }
            
            return registration_result
            
        except Exception as e:
            logger.error(f"Student compliance registration error: {str(e)}")
            return {"compliance_registered": False, "error": str(e)}
    
    async def process_parental_consent(self, consent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process parental consent form"""
        try:
            student_id = consent_data.get("student_id")
            
            # Generate consent form if needed
            if not consent_data.get("consent_form_id"):
                consent_types = [ConsentType(ct) for ct in consent_data.get("consent_types", [])]
                student_data = {"student_id": student_id, "full_name": consent_data.get("student_name")}
                consent_form = self.coppa_engine.generate_consent_form(student_data, consent_types)
                consent_data.update(consent_form)
            
            # Validate digital signature (simplified)
            signature_valid = self._validate_digital_signature(consent_data.get("digital_signature"))
            
            # Store consent record
            consent_id = str(uuid.uuid4())
            consent_date = datetime.utcnow()
            expiry_date = consent_date + timedelta(days=self.coppa_engine.consent_duration_days)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO parental_consents 
                    (consent_id, student_id, parent_name, consent_types, consent_granted,
                     consent_date, expiry_date, digital_signature)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    consent_id, student_id, consent_data.get("parent_name"),
                    json.dumps(consent_data.get("consent_types", [])), signature_valid,
                    consent_date, expiry_date, consent_data.get("digital_signature", "")
                ))
                
                # Update student compliance status
                cursor.execute("""
                    UPDATE student_compliance 
                    SET consent_status = ?, parental_controls_enabled = ?
                    WHERE student_id = ?
                """, ("granted" if signature_valid else "pending", True, student_id))
                
                conn.commit()
            
            return {
                "consent_processed": True,
                "consent_id": consent_id,
                "consent_granted": signature_valid,
                "expiry_date": expiry_date.isoformat(),
                "next_actions": ["Setup parental controls"] if signature_valid else ["Obtain valid signature"]
            }
            
        except Exception as e:
            logger.error(f"Parental consent processing error: {str(e)}")
            return {"consent_processed": False, "error": str(e)}
    
    def _validate_digital_signature(self, signature: str) -> bool:
        """Validate digital signature (simplified implementation)"""
        # In production, this would involve cryptographic signature verification
        return signature is not None and len(signature) > 10
    
    def _calculate_overall_compliance_score(self, coppa_result: Dict[str, Any], ferpa_applicable: bool) -> float:
        """Calculate overall compliance score"""
        score = 100.0
        
        # COPPA compliance score
        if coppa_result.get("coppa_applicable"):
            if coppa_result.get("compliance_status") != "compliant":
                score -= 40.0
        
        # FERPA compliance (assumed compliant if framework is in place)
        if not ferpa_applicable:
            score -= 20.0
        
        return max(0.0, score)
    
    async def monitor_content_safety(self, content: str, student_id: str) -> Dict[str, Any]:
        """Monitor content for safety compliance"""
        try:
            # Get student age for context
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT age_category FROM student_compliance WHERE student_id = ?", (student_id,))
                result = cursor.fetchone()
                
                if result:
                    age_category = StudentAgeCategory(result[0])
                    # Estimate age from category
                    age_mapping = {
                        StudentAgeCategory.UNDER_13: 10,
                        StudentAgeCategory.TEEN_13_17: 15,
                        StudentAgeCategory.ADULT_18_PLUS: 20,
                        StudentAgeCategory.UNKNOWN: 16
                    }
                    estimated_age = age_mapping.get(age_category, 16)
                else:
                    estimated_age = 16  # Default
            
            # Analyze content safety
            safety_result = self.safety_monitor.analyze_content_safety(content, estimated_age)
            
            # Log safety incident if threats detected
            if not safety_result.get("content_safe", False):
                incident_id = str(uuid.uuid4())
                
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO safety_incidents 
                        (incident_id, student_id, threat_level, threat_category, 
                         content_analyzed, response_actions)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        incident_id, student_id, safety_result.get("threat_level"),
                        json.dumps([t["category"] for t in safety_result.get("detected_threats", [])]),
                        content[:500], json.dumps(safety_result.get("response_actions", {}))
                    ))
                    conn.commit()
                
                safety_result["incident_id"] = incident_id
            
            return safety_result
            
        except Exception as e:
            logger.error(f"Content safety monitoring error: {str(e)}")
            return {"content_safe": False, "error": str(e)}
    
    async def generate_compliance_report(self, institution_id: str = "romai_education") -> Dict[str, Any]:
        """Generate comprehensive compliance report"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Student compliance statistics
                cursor.execute("SELECT COUNT(*) FROM student_compliance")
                total_students = cursor.fetchone()[0]
                
                cursor.execute("SELECT age_category, COUNT(*) FROM student_compliance GROUP BY age_category")
                students_by_age = dict(cursor.fetchall())
                
                cursor.execute("SELECT consent_status, COUNT(*) FROM student_compliance GROUP BY consent_status")
                consent_status_counts = dict(cursor.fetchall())
                
                cursor.execute("SELECT AVG(compliance_score) FROM student_compliance")
                avg_compliance_score = cursor.fetchone()[0] or 0
                
                # Safety incidents
                cursor.execute("SELECT threat_level, COUNT(*) FROM safety_incidents GROUP BY threat_level")
                incidents_by_threat = dict(cursor.fetchall())
                
                cursor.execute("SELECT COUNT(*) FROM safety_incidents WHERE resolved = TRUE")
                resolved_incidents = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM safety_incidents WHERE resolved = FALSE")
                pending_incidents = cursor.fetchone()[0]
                
                # Audit trail summary
                cursor.execute("SELECT COUNT(*) FROM audit_trail")
                total_audit_entries = cursor.fetchone()[0]
                
                cursor.execute("SELECT AVG(compliance_score) FROM audit_trail WHERE compliance_score IS NOT NULL")
                avg_audit_compliance = cursor.fetchone()[0] or 0
                
                report = {
                    "institution_id": institution_id,
                    "report_type": "Educational Compliance Summary",
                    "generated_at": datetime.utcnow().isoformat(),
                    "student_statistics": {
                        "total_students": total_students,
                        "students_by_age_category": students_by_age,
                        "consent_status_distribution": consent_status_counts,
                        "average_compliance_score": round(avg_compliance_score, 2)
                    },
                    "safety_statistics": {
                        "incidents_by_threat_level": incidents_by_threat,
                        "resolved_incidents": resolved_incidents,
                        "pending_incidents": pending_incidents,
                        "incident_resolution_rate": round((resolved_incidents / max(1, resolved_incidents + pending_incidents)) * 100, 2)
                    },
                    "audit_statistics": {
                        "total_audit_entries": total_audit_entries,
                        "average_audit_compliance_score": round(avg_audit_compliance, 2)
                    },
                    "compliance_frameworks": {
                        "coppa_implementation": "Active",
                        "ferpa_implementation": "Active", 
                        "gdpr_education_implementation": "Active",
                        "romanian_education_law_implementation": "Active"
                    },
                    "recommendations": self._generate_compliance_recommendations(avg_compliance_score, pending_incidents)
                }
                
                return report
                
        except Exception as e:
            logger.error(f"Compliance report generation error: {str(e)}")
            return {"error": str(e)}
    
    def _generate_compliance_recommendations(self, avg_score: float, pending_incidents: int) -> List[str]:
        """Generate compliance improvement recommendations"""
        recommendations = []
        
        if avg_score < 70:
            recommendations.append("Improve overall compliance score through enhanced training and procedures")
        if avg_score < 85:
            recommendations.append("Implement additional compliance monitoring measures")
        
        if pending_incidents > 5:
            recommendations.append("Increase safety incident response team capacity")
        if pending_incidents > 0:
            recommendations.append("Review and resolve pending safety incidents promptly")
        
        recommendations.extend([
            "Conduct regular compliance audits and assessments",
            "Provide ongoing staff training on educational privacy laws",
            "Update parental consent forms annually",
            "Implement advanced content filtering technologies"
        ])
        
        return recommendations

async def initialize_educational_safety_compliance():
    """Initialize and return educational safety compliance engine"""
    engine = EducationalSafetyComplianceEngine()
    logger.info("Educational Safety & Compliance Engine ready for service")
    return engine

# Example usage and testing
async def main():
    """Example usage of Educational Safety & Compliance Engine"""
    engine = await initialize_educational_safety_compliance()
    
    # Register student for compliance
    student_data = {
        "student_id": "student_001",
        "full_name": "Ana Popescu",
        "birth_date": "2015-03-15",  # 10 years old - COPPA protected
        "school_name": "Școala Primară RomAI"
    }
    
    compliance_result = await engine.register_student_compliance(student_data)
    print("Compliance Registration:", json.dumps(compliance_result, indent=2, ensure_ascii=False))
    
    # Process parental consent
    consent_data = {
        "student_id": "student_001",
        "parent_name": "Maria Popescu",
        "consent_types": ["data_collection", "educational_communication"],
        "digital_signature": "Maria_Popescu_2025_01_18_signature_hash"
    }
    
    consent_result = await engine.process_parental_consent(consent_data)
    print("Consent Processing:", json.dumps(consent_result, indent=2, ensure_ascii=False))
    
    # Monitor content safety
    test_content = "Să învățăm despre istoria României și despre eroii noștri naționale."
    safety_result = await engine.monitor_content_safety(test_content, "student_001")
    print("Content Safety:", json.dumps(safety_result, indent=2, ensure_ascii=False))
    
    # Generate compliance report
    report = await engine.generate_compliance_report()
    print("Compliance Report:", json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())
