"""
RomAI Phase 4.2: BancAI Financial Intelligence - Regulatory Compliance Engine
Banking regulation compliance, financial data protection, and audit trail systems.

This module implements comprehensive regulatory compliance capabilities including:
- Romanian banking regulation compliance (NBR, BNR)
- EU financial regulations (MiFID II, PSD2, GDPR)
- Financial data protection and encryption
- Comprehensive audit trail systems
- Regulatory reporting and compliance monitoring

Author: RomAI Development Team
Created: August 2025
License: Proprietary
"""

import asyncio
import logging
import sqlite3
import json
import hashlib
import hmac
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ComplianceFramework(Enum):
    """Supported compliance frameworks."""
    NBR = "nbr"  # Romanian National Bank
    BNR = "bnr"  # Romanian National Bank (old acronym)
    MIFID_II = "mifid_ii"  # Markets in Financial Instruments Directive
    PSD2 = "psd2"  # Payment Services Directive 2
    GDPR = "gdpr"  # General Data Protection Regulation
    AML = "aml"  # Anti-Money Laundering
    KYC = "kyc"  # Know Your Customer
    PCI_DSS = "pci_dss"  # Payment Card Industry Data Security Standard
    BASEL_III = "basel_iii"  # Basel III banking regulations
    IFRS = "ifrs"  # International Financial Reporting Standards


class ComplianceStatus(Enum):
    """Compliance status levels."""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    REQUIRES_ACTION = "requires_action"
    UNDER_INVESTIGATION = "under_investigation"


class DataClassification(Enum):
    """Data classification levels for protection."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"


class AuditEventType(Enum):
    """Types of audit events."""
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    USER_AUTHENTICATION = "user_authentication"
    SYSTEM_CONFIGURATION = "system_configuration"
    COMPLIANCE_VIOLATION = "compliance_violation"
    SECURITY_INCIDENT = "security_incident"
    REGULATORY_REPORT = "regulatory_report"
    TRANSACTION_PROCESSING = "transaction_processing"


@dataclass
class ComplianceRule:
    """Compliance rule structure."""
    rule_id: str
    framework: ComplianceFramework
    title: str
    description: str
    requirements: List[str]
    validation_criteria: Dict[str, Any]
    severity: str
    created_date: datetime


@dataclass
class ComplianceAssessment:
    """Compliance assessment result."""
    assessment_id: str
    entity_id: str
    framework: ComplianceFramework
    status: ComplianceStatus
    score: float
    violations: List[str]
    recommendations: List[str]
    assessed_by: str
    assessment_date: datetime


@dataclass
class AuditEvent:
    """Audit event structure."""
    event_id: str
    event_type: AuditEventType
    user_id: str
    entity_id: str
    action: str
    details: Dict[str, Any]
    timestamp: datetime
    ip_address: str
    user_agent: str


@dataclass
class RegulatoryReport:
    """Regulatory report structure."""
    report_id: str
    framework: ComplianceFramework
    report_type: str
    reporting_period: str
    generated_by: str
    data: Dict[str, Any]
    generated_date: datetime
    submitted_date: Optional[datetime] = None


class DataProtectionManager:
    """Advanced data protection and encryption system."""
    
    def __init__(self, master_key: Optional[bytes] = None):
        self.master_key = master_key or self._generate_master_key()
        self.encryption_suite = self._init_encryption_suite()
        self.data_classifications = {}
        
    def _generate_master_key(self) -> bytes:
        """Generate master encryption key."""
        try:
            # Generate a random key for encryption
            password = os.urandom(32)
            salt = os.urandom(16)
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            
            key = base64.urlsafe_b64encode(kdf.derive(password))
            
            # Store salt for key derivation (in production, store securely)
            self.salt = salt
            self.password = password
            
            return key
            
        except Exception as e:
            logger.error(f"Error generating master key: {e}")
            raise
            
    def _init_encryption_suite(self) -> Fernet:
        """Initialize encryption suite."""
        try:
            return Fernet(self.master_key)
        except Exception as e:
            logger.error(f"Error initializing encryption suite: {e}")
            raise
            
    def encrypt_sensitive_data(self, data: str, classification: DataClassification) -> str:
        """Encrypt sensitive data based on classification."""
        try:
            logger.info(f"Encrypting data with classification: {classification.value}")
            
            # Convert string to bytes
            data_bytes = data.encode('utf-8')
            
            # Add metadata
            metadata = {
                "classification": classification.value,
                "encrypted_at": datetime.now().isoformat(),
                "version": "1.0"
            }
            
            # Combine metadata and data
            combined_data = json.dumps({
                "metadata": metadata,
                "data": base64.b64encode(data_bytes).decode('utf-8')
            }).encode('utf-8')
            
            # Encrypt combined data
            encrypted_data = self.encryption_suite.encrypt(combined_data)
            
            # Return base64 encoded encrypted data
            return base64.b64encode(encrypted_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error encrypting data: {e}")
            raise
            
    def decrypt_sensitive_data(self, encrypted_data: str) -> Tuple[str, DataClassification]:
        """Decrypt sensitive data and return with classification."""
        try:
            logger.info("Decrypting sensitive data")
            
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
            
            # Decrypt data
            decrypted_bytes = self.encryption_suite.decrypt(encrypted_bytes)
            
            # Parse combined data
            combined_data = json.loads(decrypted_bytes.decode('utf-8'))
            metadata = combined_data["metadata"]
            data_b64 = combined_data["data"]
            
            # Decode original data
            original_data = base64.b64decode(data_b64).decode('utf-8')
            
            # Get classification
            classification = DataClassification(metadata["classification"])
            
            logger.info(f"Data decrypted with classification: {classification.value}")
            return original_data, classification
            
        except Exception as e:
            logger.error(f"Error decrypting data: {e}")
            raise
            
    def hash_pii_data(self, pii_data: str) -> str:
        """Create one-way hash of PII data for compliance."""
        try:
            # Use HMAC with master key for secure hashing
            hmac_obj = hmac.new(
                self.master_key,
                pii_data.encode('utf-8'),
                hashlib.sha256
            )
            
            return hmac_obj.hexdigest()
            
        except Exception as e:
            logger.error(f"Error hashing PII data: {e}")
            raise
            
    def validate_data_access(self, user_id: str, data_classification: DataClassification, 
                           action: str) -> bool:
        """Validate if user can access data based on classification."""
        try:
            # Simplified access control logic
            # In production, this would integrate with proper RBAC system
            
            access_matrix = {
                DataClassification.PUBLIC: ["read", "write"],
                DataClassification.INTERNAL: ["read", "write"],
                DataClassification.CONFIDENTIAL: ["read"],
                DataClassification.RESTRICTED: [],
                DataClassification.TOP_SECRET: []
            }
            
            # Admin users have full access
            if user_id.startswith("admin_"):
                return True
                
            # Check access permissions
            allowed_actions = access_matrix.get(data_classification, [])
            return action in allowed_actions
            
        except Exception as e:
            logger.error(f"Error validating data access: {e}")
            return False


class RomanianBankingComplianceEngine:
    """Romanian banking regulation compliance engine."""
    
    def __init__(self):
        self.nbr_rules = {}
        self.compliance_cache = {}
        self._load_nbr_regulations()
        
    def _load_nbr_regulations(self):
        """Load Romanian National Bank regulations."""
        try:
            # Load NBR (Romanian National Bank) regulations
            self.nbr_rules = {
                "capital_adequacy": {
                    "minimum_capital_ratio": 0.08,  # 8% minimum
                    "tier1_ratio": 0.06,  # 6% minimum
                    "leverage_ratio": 0.03  # 3% minimum
                },
                "liquidity_requirements": {
                    "lcr_minimum": 1.0,  # Liquidity Coverage Ratio 100%
                    "nsfr_minimum": 1.0  # Net Stable Funding Ratio 100%
                },
                "risk_management": {
                    "large_exposure_limit": 0.25,  # 25% of capital
                    "operational_risk_limit": 0.15  # 15% of capital
                },
                "customer_protection": {
                    "deposit_insurance": 100000,  # EUR 100,000 per depositor
                    "complaint_resolution_days": 15,
                    "cooling_off_period": 14  # days
                },
                "reporting_requirements": {
                    "prudential_report_frequency": "monthly",
                    "statistical_report_frequency": "quarterly",
                    "audit_report_frequency": "annual"
                }
            }
            
            logger.info("NBR regulations loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading NBR regulations: {e}")
            
    async def assess_capital_adequacy(self, bank_data: Dict) -> ComplianceAssessment:
        """Assess capital adequacy compliance."""
        try:
            logger.info("Assessing capital adequacy compliance")
            
            assessment_id = str(uuid.uuid4())
            violations = []
            recommendations = []
            
            # Extract financial data
            total_assets = bank_data.get("total_assets", 0)
            risk_weighted_assets = bank_data.get("risk_weighted_assets", 0)
            tier1_capital = bank_data.get("tier1_capital", 0)
            total_capital = bank_data.get("total_capital", 0)
            
            # Calculate ratios
            if risk_weighted_assets > 0:
                capital_ratio = total_capital / risk_weighted_assets
                tier1_ratio = tier1_capital / risk_weighted_assets
            else:
                capital_ratio = 0
                tier1_ratio = 0
                
            if total_assets > 0:
                leverage_ratio = tier1_capital / total_assets
            else:
                leverage_ratio = 0
                
            # Check compliance
            score = 100.0
            
            if capital_ratio < self.nbr_rules["capital_adequacy"]["minimum_capital_ratio"]:
                violations.append(f"Capital ratio {capital_ratio:.2%} below minimum {self.nbr_rules['capital_adequacy']['minimum_capital_ratio']:.2%}")
                recommendations.append("Increase capital base or reduce risk-weighted assets")
                score -= 30
                
            if tier1_ratio < self.nbr_rules["capital_adequacy"]["tier1_ratio"]:
                violations.append(f"Tier 1 ratio {tier1_ratio:.2%} below minimum {self.nbr_rules['capital_adequacy']['tier1_ratio']:.2%}")
                recommendations.append("Strengthen Tier 1 capital position")
                score -= 25
                
            if leverage_ratio < self.nbr_rules["capital_adequacy"]["leverage_ratio"]:
                violations.append(f"Leverage ratio {leverage_ratio:.2%} below minimum {self.nbr_rules['capital_adequacy']['leverage_ratio']:.2%}")
                recommendations.append("Reduce leverage or increase Tier 1 capital")
                score -= 20
                
            # Determine status
            if not violations:
                status = ComplianceStatus.COMPLIANT
            elif score > 70:
                status = ComplianceStatus.REQUIRES_ACTION
            else:
                status = ComplianceStatus.NON_COMPLIANT
                
            return ComplianceAssessment(
                assessment_id=assessment_id,
                entity_id=bank_data.get("bank_id", "unknown"),
                framework=ComplianceFramework.NBR,
                status=status,
                score=max(score, 0) / 100,
                violations=violations,
                recommendations=recommendations,
                assessed_by="automated_system",
                assessment_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing capital adequacy: {e}")
            raise
            
    async def assess_liquidity_compliance(self, bank_data: Dict) -> ComplianceAssessment:
        """Assess liquidity requirements compliance."""
        try:
            logger.info("Assessing liquidity compliance")
            
            assessment_id = str(uuid.uuid4())
            violations = []
            recommendations = []
            
            # Extract liquidity data
            lcr = bank_data.get("liquidity_coverage_ratio", 0)
            nsfr = bank_data.get("net_stable_funding_ratio", 0)
            
            score = 100.0
            
            # Check LCR compliance
            if lcr < self.nbr_rules["liquidity_requirements"]["lcr_minimum"]:
                violations.append(f"LCR {lcr:.2%} below minimum {self.nbr_rules['liquidity_requirements']['lcr_minimum']:.2%}")
                recommendations.append("Increase high-quality liquid assets or reduce short-term outflows")
                score -= 50
                
            # Check NSFR compliance
            if nsfr < self.nbr_rules["liquidity_requirements"]["nsfr_minimum"]:
                violations.append(f"NSFR {nsfr:.2%} below minimum {self.nbr_rules['liquidity_requirements']['nsfr_minimum']:.2%}")
                recommendations.append("Increase stable funding sources or reduce required stable funding")
                score -= 50
                
            # Determine status
            if not violations:
                status = ComplianceStatus.COMPLIANT
            elif score > 60:
                status = ComplianceStatus.REQUIRES_ACTION
            else:
                status = ComplianceStatus.NON_COMPLIANT
                
            return ComplianceAssessment(
                assessment_id=assessment_id,
                entity_id=bank_data.get("bank_id", "unknown"),
                framework=ComplianceFramework.NBR,
                status=status,
                score=max(score, 0) / 100,
                violations=violations,
                recommendations=recommendations,
                assessed_by="automated_system",
                assessment_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing liquidity compliance: {e}")
            raise


class EUFinancialComplianceEngine:
    """EU financial regulations compliance engine (MiFID II, PSD2, GDPR)."""
    
    def __init__(self):
        self.mifid_rules = {}
        self.psd2_rules = {}
        self.gdpr_rules = {}
        self._load_eu_regulations()
        
    def _load_eu_regulations(self):
        """Load EU financial regulations."""
        try:
            # MiFID II regulations
            self.mifid_rules = {
                "investor_protection": {
                    "suitability_assessment": True,
                    "appropriateness_test": True,
                    "best_execution": True,
                    "product_governance": True
                },
                "transparency": {
                    "pre_trade_transparency": True,
                    "post_trade_transparency": True,
                    "transaction_reporting": True
                },
                "conduct_of_business": {
                    "client_categorization": True,
                    "conflicts_of_interest": True,
                    "inducements": True
                }
            }
            
            # PSD2 regulations
            self.psd2_rules = {
                "strong_customer_authentication": {
                    "multi_factor_auth": True,
                    "dynamic_linking": True,
                    "exemptions_limited": True
                },
                "open_banking": {
                    "api_access": True,
                    "account_information": True,
                    "payment_initiation": True
                },
                "security_measures": {
                    "fraud_monitoring": True,
                    "incident_reporting": True,
                    "risk_assessment": True
                }
            }
            
            # GDPR regulations for financial services
            self.gdpr_rules = {
                "data_protection": {
                    "lawful_basis": True,
                    "consent_management": True,
                    "data_minimization": True,
                    "purpose_limitation": True
                },
                "individual_rights": {
                    "right_to_access": True,
                    "right_to_rectification": True,
                    "right_to_erasure": True,
                    "right_to_portability": True
                },
                "governance": {
                    "privacy_by_design": True,
                    "impact_assessments": True,
                    "breach_notification": True
                }
            }
            
            logger.info("EU regulations loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading EU regulations: {e}")
            
    async def assess_mifid_compliance(self, service_data: Dict) -> ComplianceAssessment:
        """Assess MiFID II compliance."""
        try:
            logger.info("Assessing MiFID II compliance")
            
            assessment_id = str(uuid.uuid4())
            violations = []
            recommendations = []
            score = 100.0
            
            # Check investor protection measures
            if not service_data.get("suitability_assessment_implemented", False):
                violations.append("Suitability assessment not implemented")
                recommendations.append("Implement comprehensive suitability assessment process")
                score -= 25
                
            if not service_data.get("appropriateness_test_implemented", False):
                violations.append("Appropriateness test not implemented")
                recommendations.append("Implement appropriateness test for complex instruments")
                score -= 20
                
            if not service_data.get("best_execution_policy", False):
                violations.append("Best execution policy not established")
                recommendations.append("Establish and implement best execution policy")
                score -= 20
                
            # Check transparency requirements
            if not service_data.get("transaction_reporting", False):
                violations.append("Transaction reporting not implemented")
                recommendations.append("Implement systematic transaction reporting")
                score -= 15
                
            # Check conduct of business rules
            if not service_data.get("client_categorization", False):
                violations.append("Client categorization not implemented")
                recommendations.append("Implement proper client categorization system")
                score -= 20
                
            # Determine status
            if not violations:
                status = ComplianceStatus.COMPLIANT
            elif score > 70:
                status = ComplianceStatus.REQUIRES_ACTION
            else:
                status = ComplianceStatus.NON_COMPLIANT
                
            return ComplianceAssessment(
                assessment_id=assessment_id,
                entity_id=service_data.get("service_id", "unknown"),
                framework=ComplianceFramework.MIFID_II,
                status=status,
                score=max(score, 0) / 100,
                violations=violations,
                recommendations=recommendations,
                assessed_by="automated_system",
                assessment_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing MiFID II compliance: {e}")
            raise
            
    async def assess_psd2_compliance(self, payment_service_data: Dict) -> ComplianceAssessment:
        """Assess PSD2 compliance."""
        try:
            logger.info("Assessing PSD2 compliance")
            
            assessment_id = str(uuid.uuid4())
            violations = []
            recommendations = []
            score = 100.0
            
            # Check Strong Customer Authentication
            if not payment_service_data.get("multi_factor_authentication", False):
                violations.append("Multi-factor authentication not implemented")
                recommendations.append("Implement robust multi-factor authentication")
                score -= 30
                
            if not payment_service_data.get("dynamic_linking", False):
                violations.append("Dynamic linking not implemented")
                recommendations.append("Implement dynamic linking for payment authentication")
                score -= 25
                
            # Check Open Banking APIs
            if not payment_service_data.get("api_access_provided", False):
                violations.append("API access not provided to TPPs")
                recommendations.append("Provide standardized API access for third-party providers")
                score -= 20
                
            # Check security measures
            if not payment_service_data.get("fraud_monitoring", False):
                violations.append("Fraud monitoring not implemented")
                recommendations.append("Implement comprehensive fraud monitoring system")
                score -= 15
                
            if not payment_service_data.get("incident_reporting", False):
                violations.append("Incident reporting not implemented")
                recommendations.append("Implement systematic incident reporting")
                score -= 10
                
            # Determine status
            if not violations:
                status = ComplianceStatus.COMPLIANT
            elif score > 70:
                status = ComplianceStatus.REQUIRES_ACTION
            else:
                status = ComplianceStatus.NON_COMPLIANT
                
            return ComplianceAssessment(
                assessment_id=assessment_id,
                entity_id=payment_service_data.get("service_id", "unknown"),
                framework=ComplianceFramework.PSD2,
                status=status,
                score=max(score, 0) / 100,
                violations=violations,
                recommendations=recommendations,
                assessed_by="automated_system",
                assessment_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing PSD2 compliance: {e}")
            raise
            
    async def assess_gdpr_compliance(self, data_processing: Dict) -> ComplianceAssessment:
        """Assess GDPR compliance for financial data processing."""
        try:
            logger.info("Assessing GDPR compliance")
            
            assessment_id = str(uuid.uuid4())
            violations = []
            recommendations = []
            score = 100.0
            
            # Check lawful basis
            if not data_processing.get("lawful_basis_identified", False):
                violations.append("Lawful basis for processing not identified")
                recommendations.append("Identify and document lawful basis for all data processing")
                score -= 25
                
            # Check consent management
            if not data_processing.get("consent_management_system", False):
                violations.append("Consent management system not implemented")
                recommendations.append("Implement comprehensive consent management system")
                score -= 20
                
            # Check data minimization
            if not data_processing.get("data_minimization_principle", False):
                violations.append("Data minimization principle not applied")
                recommendations.append("Apply data minimization principle to all processing")
                score -= 15
                
            # Check individual rights
            if not data_processing.get("individual_rights_procedures", False):
                violations.append("Individual rights procedures not established")
                recommendations.append("Establish procedures for handling individual rights requests")
                score -= 20
                
            # Check privacy by design
            if not data_processing.get("privacy_by_design", False):
                violations.append("Privacy by design not implemented")
                recommendations.append("Implement privacy by design in all systems")
                score -= 10
                
            # Check breach notification
            if not data_processing.get("breach_notification_procedure", False):
                violations.append("Breach notification procedure not established")
                recommendations.append("Establish 72-hour breach notification procedure")
                score -= 10
                
            # Determine status
            if not violations:
                status = ComplianceStatus.COMPLIANT
            elif score > 70:
                status = ComplianceStatus.REQUIRES_ACTION
            else:
                status = ComplianceStatus.NON_COMPLIANT
                
            return ComplianceAssessment(
                assessment_id=assessment_id,
                entity_id=data_processing.get("processing_id", "unknown"),
                framework=ComplianceFramework.GDPR,
                status=status,
                score=max(score, 0) / 100,
                violations=violations,
                recommendations=recommendations,
                assessed_by="automated_system",
                assessment_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing GDPR compliance: {e}")
            raise


class AuditTrailManager:
    """Comprehensive audit trail system for regulatory compliance."""
    
    def __init__(self, db_path: str = "audit_trail.db"):
        self.db_path = db_path
        self.audit_buffer = []
        self.buffer_size = 100
        self._init_audit_database()
        
    def _init_audit_database(self):
        """Initialize audit trail database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Audit events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id TEXT UNIQUE NOT NULL,
                    event_type TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    details TEXT,
                    timestamp TEXT NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Compliance assessments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS compliance_assessments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    assessment_id TEXT UNIQUE NOT NULL,
                    entity_id TEXT NOT NULL,
                    framework TEXT NOT NULL,
                    status TEXT NOT NULL,
                    score REAL NOT NULL,
                    violations TEXT,
                    recommendations TEXT,
                    assessed_by TEXT NOT NULL,
                    assessment_date TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Regulatory reports table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS regulatory_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_id TEXT UNIQUE NOT NULL,
                    framework TEXT NOT NULL,
                    report_type TEXT NOT NULL,
                    reporting_period TEXT NOT NULL,
                    generated_by TEXT NOT NULL,
                    data TEXT,
                    generated_date TEXT NOT NULL,
                    submitted_date TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_events(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_compliance_entity ON compliance_assessments(entity_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_compliance_framework ON compliance_assessments(framework)")
            
            conn.commit()
            conn.close()
            logger.info("Audit trail database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing audit database: {e}")
            
    async def log_audit_event(self, event: AuditEvent):
        """Log audit event to trail."""
        try:
            logger.info(f"Logging audit event: {event.event_type.value}")
            
            # Add to buffer
            self.audit_buffer.append(event)
            
            # Flush buffer if full
            if len(self.audit_buffer) >= self.buffer_size:
                await self._flush_audit_buffer()
                
        except Exception as e:
            logger.error(f"Error logging audit event: {e}")
            
    async def _flush_audit_buffer(self):
        """Flush audit buffer to database."""
        try:
            if not self.audit_buffer:
                return
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Insert buffered events
            for event in self.audit_buffer:
                cursor.execute("""
                    INSERT OR REPLACE INTO audit_events 
                    (event_id, event_type, user_id, entity_id, action, details, 
                     timestamp, ip_address, user_agent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.event_id,
                    event.event_type.value,
                    event.user_id,
                    event.entity_id,
                    event.action,
                    json.dumps(event.details),
                    event.timestamp.isoformat(),
                    event.ip_address,
                    event.user_agent
                ))
                
            conn.commit()
            conn.close()
            
            logger.info(f"Flushed {len(self.audit_buffer)} audit events to database")
            self.audit_buffer.clear()
            
        except Exception as e:
            logger.error(f"Error flushing audit buffer: {e}")
            
    async def store_compliance_assessment(self, assessment: ComplianceAssessment):
        """Store compliance assessment result."""
        try:
            logger.info(f"Storing compliance assessment: {assessment.assessment_id}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO compliance_assessments 
                (assessment_id, entity_id, framework, status, score, violations, 
                 recommendations, assessed_by, assessment_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                assessment.assessment_id,
                assessment.entity_id,
                assessment.framework.value,
                assessment.status.value,
                assessment.score,
                json.dumps(assessment.violations),
                json.dumps(assessment.recommendations),
                assessment.assessed_by,
                assessment.assessment_date.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            # Log audit event
            audit_event = AuditEvent(
                event_id=str(uuid.uuid4()),
                event_type=AuditEventType.COMPLIANCE_VIOLATION if assessment.status != ComplianceStatus.COMPLIANT else AuditEventType.SYSTEM_CONFIGURATION,
                user_id="system",
                entity_id=assessment.entity_id,
                action="compliance_assessment",
                details={
                    "framework": assessment.framework.value,
                    "status": assessment.status.value,
                    "score": assessment.score
                },
                timestamp=datetime.now(),
                ip_address="127.0.0.1",
                user_agent="RomAI_Compliance_Engine"
            )
            
            await self.log_audit_event(audit_event)
            
        except Exception as e:
            logger.error(f"Error storing compliance assessment: {e}")
            
    async def store_regulatory_report(self, report: RegulatoryReport):
        """Store regulatory report."""
        try:
            logger.info(f"Storing regulatory report: {report.report_id}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO regulatory_reports 
                (report_id, framework, report_type, reporting_period, generated_by, 
                 data, generated_date, submitted_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                report.report_id,
                report.framework.value,
                report.report_type,
                report.reporting_period,
                report.generated_by,
                json.dumps(report.data),
                report.generated_date.isoformat(),
                report.submitted_date.isoformat() if report.submitted_date else None
            ))
            
            conn.commit()
            conn.close()
            
            # Log audit event
            audit_event = AuditEvent(
                event_id=str(uuid.uuid4()),
                event_type=AuditEventType.REGULATORY_REPORT,
                user_id=report.generated_by,
                entity_id=report.report_id,
                action="generate_regulatory_report",
                details={
                    "framework": report.framework.value,
                    "report_type": report.report_type,
                    "reporting_period": report.reporting_period
                },
                timestamp=datetime.now(),
                ip_address="127.0.0.1",
                user_agent="RomAI_Compliance_Engine"
            )
            
            await self.log_audit_event(audit_event)
            
        except Exception as e:
            logger.error(f"Error storing regulatory report: {e}")
            
    async def get_audit_trail(self, entity_id: str, start_date: datetime, 
                            end_date: datetime) -> List[AuditEvent]:
        """Get audit trail for specific entity and time period."""
        try:
            logger.info(f"Retrieving audit trail for {entity_id}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT event_id, event_type, user_id, entity_id, action, details, 
                       timestamp, ip_address, user_agent
                FROM audit_events 
                WHERE entity_id = ? AND timestamp BETWEEN ? AND ?
                ORDER BY timestamp DESC
            """, (entity_id, start_date.isoformat(), end_date.isoformat()))
            
            events = []
            for row in cursor.fetchall():
                event = AuditEvent(
                    event_id=row[0],
                    event_type=AuditEventType(row[1]),
                    user_id=row[2],
                    entity_id=row[3],
                    action=row[4],
                    details=json.loads(row[5]) if row[5] else {},
                    timestamp=datetime.fromisoformat(row[6]),
                    ip_address=row[7] or "",
                    user_agent=row[8] or ""
                )
                events.append(event)
                
            conn.close()
            return events
            
        except Exception as e:
            logger.error(f"Error retrieving audit trail: {e}")
            return []
            
    async def generate_compliance_report(self, framework: ComplianceFramework, 
                                       reporting_period: str) -> RegulatoryReport:
        """Generate compliance report for regulatory submission."""
        try:
            logger.info(f"Generating compliance report for {framework.value}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get compliance assessments for period
            cursor.execute("""
                SELECT * FROM compliance_assessments 
                WHERE framework = ? AND assessment_date LIKE ?
                ORDER BY assessment_date DESC
            """, (framework.value, f"{reporting_period}%"))
            
            assessments = cursor.fetchall()
            
            # Calculate summary statistics
            total_assessments = len(assessments)
            compliant_count = sum(1 for a in assessments if a[4] == ComplianceStatus.COMPLIANT.value)
            average_score = sum(a[5] for a in assessments) / total_assessments if total_assessments > 0 else 0
            
            # Generate report data
            report_data = {
                "summary": {
                    "total_assessments": total_assessments,
                    "compliant_count": compliant_count,
                    "compliance_rate": compliant_count / total_assessments if total_assessments > 0 else 0,
                    "average_score": average_score
                },
                "assessments": [
                    {
                        "assessment_id": a[1],
                        "entity_id": a[2],
                        "status": a[4],
                        "score": a[5],
                        "violations": json.loads(a[6]) if a[6] else [],
                        "assessment_date": a[9]
                    }
                    for a in assessments
                ],
                "generated_at": datetime.now().isoformat()
            }
            
            conn.close()
            
            # Create regulatory report
            report = RegulatoryReport(
                report_id=str(uuid.uuid4()),
                framework=framework,
                report_type="compliance_summary",
                reporting_period=reporting_period,
                generated_by="automated_system",
                data=report_data,
                generated_date=datetime.now()
            )
            
            # Store report
            await self.store_regulatory_report(report)
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating compliance report: {e}")
            raise


class RegulatoryComplianceEngine:
    """Main regulatory compliance engine coordinating all components."""
    
    def __init__(self, db_path: str = "regulatory_compliance.db"):
        self.db_path = db_path
        self.data_protection = DataProtectionManager()
        self.romanian_compliance = RomanianBankingComplianceEngine()
        self.eu_compliance = EUFinancialComplianceEngine()
        self.audit_manager = AuditTrailManager(db_path)
        
    async def comprehensive_compliance_assessment(self, entity_data: Dict) -> Dict[str, ComplianceAssessment]:
        """Perform comprehensive compliance assessment across all frameworks."""
        try:
            logger.info(f"Performing comprehensive compliance assessment for {entity_data.get('entity_id', 'unknown')}")
            
            assessments = {}
            
            # Romanian banking compliance (if applicable)
            if entity_data.get("entity_type") == "bank":
                nbr_assessment = await self.romanian_compliance.assess_capital_adequacy(entity_data)
                assessments["NBR_Capital"] = nbr_assessment
                await self.audit_manager.store_compliance_assessment(nbr_assessment)
                
                liquidity_assessment = await self.romanian_compliance.assess_liquidity_compliance(entity_data)
                assessments["NBR_Liquidity"] = liquidity_assessment
                await self.audit_manager.store_compliance_assessment(liquidity_assessment)
                
            # EU compliance assessments
            if entity_data.get("provides_investment_services"):
                mifid_assessment = await self.eu_compliance.assess_mifid_compliance(entity_data)
                assessments["MiFID_II"] = mifid_assessment
                await self.audit_manager.store_compliance_assessment(mifid_assessment)
                
            if entity_data.get("provides_payment_services"):
                psd2_assessment = await self.eu_compliance.assess_psd2_compliance(entity_data)
                assessments["PSD2"] = psd2_assessment
                await self.audit_manager.store_compliance_assessment(psd2_assessment)
                
            # GDPR compliance (always applicable)
            gdpr_assessment = await self.eu_compliance.assess_gdpr_compliance(entity_data)
            assessments["GDPR"] = gdpr_assessment
            await self.audit_manager.store_compliance_assessment(gdpr_assessment)
            
            logger.info(f"Completed {len(assessments)} compliance assessments")
            return assessments
            
        except Exception as e:
            logger.error(f"Error performing comprehensive compliance assessment: {e}")
            raise
            
    async def protect_financial_data(self, financial_data: Dict, 
                                   classification: DataClassification) -> str:
        """Protect financial data with appropriate encryption."""
        try:
            logger.info(f"Protecting financial data with {classification.value} classification")
            
            # Convert financial data to JSON string
            data_string = json.dumps(financial_data)
            
            # Encrypt data
            encrypted_data = self.data_protection.encrypt_sensitive_data(data_string, classification)
            
            # Log data access event
            audit_event = AuditEvent(
                event_id=str(uuid.uuid4()),
                event_type=AuditEventType.DATA_ACCESS,
                user_id="system",
                entity_id=financial_data.get("entity_id", "unknown"),
                action="encrypt_financial_data",
                details={
                    "classification": classification.value,
                    "data_size": len(data_string)
                },
                timestamp=datetime.now(),
                ip_address="127.0.0.1",
                user_agent="RomAI_Compliance_Engine"
            )
            
            await self.audit_manager.log_audit_event(audit_event)
            
            return encrypted_data
            
        except Exception as e:
            logger.error(f"Error protecting financial data: {e}")
            raise
            
    async def access_protected_data(self, encrypted_data: str, user_id: str, 
                                  action: str) -> Tuple[Dict, DataClassification]:
        """Access protected financial data with proper authorization."""
        try:
            logger.info(f"Accessing protected data for user {user_id}")
            
            # Decrypt data
            decrypted_string, classification = self.data_protection.decrypt_sensitive_data(encrypted_data)
            
            # Validate access
            if not self.data_protection.validate_data_access(user_id, classification, action):
                raise PermissionError(f"User {user_id} not authorized for {action} on {classification.value} data")
                
            # Parse financial data
            financial_data = json.loads(decrypted_string)
            
            # Log data access event
            audit_event = AuditEvent(
                event_id=str(uuid.uuid4()),
                event_type=AuditEventType.DATA_ACCESS,
                user_id=user_id,
                entity_id=financial_data.get("entity_id", "unknown"),
                action=f"access_{action}",
                details={
                    "classification": classification.value,
                    "data_size": len(decrypted_string)
                },
                timestamp=datetime.now(),
                ip_address="127.0.0.1",
                user_agent="RomAI_Compliance_Engine"
            )
            
            await self.audit_manager.log_audit_event(audit_event)
            
            return financial_data, classification
            
        except Exception as e:
            logger.error(f"Error accessing protected data: {e}")
            raise
            
    async def generate_regulatory_reports(self, reporting_period: str) -> Dict[str, RegulatoryReport]:
        """Generate all required regulatory reports."""
        try:
            logger.info(f"Generating regulatory reports for period {reporting_period}")
            
            reports = {}
            
            # Generate reports for each framework
            frameworks = [
                ComplianceFramework.NBR,
                ComplianceFramework.MIFID_II,
                ComplianceFramework.PSD2,
                ComplianceFramework.GDPR
            ]
            
            for framework in frameworks:
                report = await self.audit_manager.generate_compliance_report(framework, reporting_period)
                reports[framework.value] = report
                
            logger.info(f"Generated {len(reports)} regulatory reports")
            return reports
            
        except Exception as e:
            logger.error(f"Error generating regulatory reports: {e}")
            raise
            
    async def monitor_compliance_status(self) -> Dict[str, Any]:
        """Monitor overall compliance status across all frameworks."""
        try:
            logger.info("Monitoring compliance status")
            
            # Get recent assessments
            conn = sqlite3.connect(self.audit_manager.db_path)
            cursor = conn.cursor()
            
            # Get latest assessment for each framework
            cursor.execute("""
                SELECT framework, status, score, COUNT(*) as count
                FROM compliance_assessments 
                WHERE assessment_date > datetime('now', '-30 days')
                GROUP BY framework, status
                ORDER BY framework, status
            """)
            
            results = cursor.fetchall()
            conn.close()
            
            # Organize results
            status_summary = {}
            for framework, status, score, count in results:
                if framework not in status_summary:
                    status_summary[framework] = {}
                status_summary[framework][status] = {
                    "count": count,
                    "average_score": score
                }
                
            # Calculate overall compliance score
            total_assessments = sum(
                sum(statuses.values() for statuses in framework_data.values())
                for framework_data in status_summary.values()
                if isinstance(framework_data, dict)
            )
            
            # Simplified calculation
            compliant_assessments = sum(
                framework_data.get(ComplianceStatus.COMPLIANT.value, {}).get("count", 0)
                for framework_data in status_summary.values()
                if isinstance(framework_data, dict)
            )
            
            overall_compliance_rate = (
                compliant_assessments / total_assessments 
                if total_assessments > 0 else 0
            )
            
            return {
                "overall_compliance_rate": overall_compliance_rate,
                "framework_status": status_summary,
                "total_assessments": total_assessments,
                "monitoring_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error monitoring compliance status: {e}")
            raise


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("Starting RomAI Regulatory Compliance Engine Demo")
        
        # Initialize compliance engine
        compliance_engine = RegulatoryComplianceEngine()
        
        # Test entity data
        test_bank_data = {
            "entity_id": "BANK_RO_001",
            "entity_type": "bank",
            "bank_id": "BANK_RO_001",
            "total_assets": 1000000000,  # 1 billion
            "risk_weighted_assets": 800000000,  # 800 million
            "tier1_capital": 80000000,  # 80 million
            "total_capital": 100000000,  # 100 million
            "liquidity_coverage_ratio": 1.2,  # 120%
            "net_stable_funding_ratio": 1.1,  # 110%
            "provides_investment_services": True,
            "provides_payment_services": True,
            "suitability_assessment_implemented": True,
            "appropriateness_test_implemented": False,
            "best_execution_policy": True,
            "transaction_reporting": True,
            "client_categorization": True,
            "multi_factor_authentication": True,
            "dynamic_linking": False,
            "api_access_provided": True,
            "fraud_monitoring": True,
            "incident_reporting": True,
            "lawful_basis_identified": True,
            "consent_management_system": True,
            "data_minimization_principle": False,
            "individual_rights_procedures": True,
            "privacy_by_design": True,
            "breach_notification_procedure": True
        }
        
        # 1. Comprehensive compliance assessment
        logger.info("Running comprehensive compliance assessment...")
        assessments = await compliance_engine.comprehensive_compliance_assessment(test_bank_data)
        
        for framework, assessment in assessments.items():
            logger.info(f"{framework} Compliance: {assessment.status.value} (Score: {assessment.score:.2%})")
            if assessment.violations:
                logger.warning(f"Violations: {assessment.violations}")
                
        # 2. Data protection demonstration
        logger.info("Testing data protection...")
        sensitive_data = {
            "customer_id": "CUST_12345",
            "account_number": "RO49AAAA1B31007593840000",
            "balance": 25000.50,
            "transaction_history": ["TXN1", "TXN2", "TXN3"]
        }
        
        encrypted_data = await compliance_engine.protect_financial_data(
            sensitive_data, 
            DataClassification.CONFIDENTIAL
        )
        logger.info("Data encrypted successfully")
        
        # Access protected data
        accessed_data, classification = await compliance_engine.access_protected_data(
            encrypted_data, 
            "admin_user", 
            "read"
        )
        logger.info(f"Data accessed with classification: {classification.value}")
        
        # 3. Generate regulatory reports
        logger.info("Generating regulatory reports...")
        reports = await compliance_engine.generate_regulatory_reports("2025-08")
        
        for framework, report in reports.items():
            logger.info(f"Generated {framework} report: {report.report_id}")
            
        # 4. Monitor compliance status
        logger.info("Monitoring compliance status...")
        status = await compliance_engine.monitor_compliance_status()
        logger.info(f"Overall compliance rate: {status['overall_compliance_rate']:.2%}")
        
        logger.info("Regulatory Compliance Engine demo completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
