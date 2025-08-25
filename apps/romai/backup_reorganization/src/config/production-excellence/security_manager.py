#!/usr/bin/env python3
"""
🔒 RomAI Enterprise Security Manager
===================================

Week 4 Day 2 - Component 2: Enterprise Security Manager
Advanced security management system for Romanian AI with comprehensive threat detection,
authentication, authorization, and security compliance monitoring.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0
"""

import asyncio
import logging
import json
import time
import hashlib
import hmac
import secrets
import sqlite3
import base64
import re
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple, Any, Union, Set
from pathlib import Path
from collections import defaultdict, deque
from datetime import datetime, timedelta
import threading
import ipaddress
import urllib.parse

# Try to import optional dependencies, use alternatives if not available
try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False

try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False

try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    BLEACH_AVAILABLE = False


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class SecurityEvent:
    """Security event data structure"""
    event_id: str
    timestamp: datetime
    event_type: str
    severity: str
    source_ip: str
    user_id: Optional[str]
    description: str
    details: Dict[str, Any]
    resolved: bool
    resolution_time: Optional[datetime]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        data['resolution_time'] = self.resolution_time.isoformat() if self.resolution_time else None
        return data


@dataclass
class UserSession:
    """User session data structure"""
    session_id: str
    user_id: str
    ip_address: str
    user_agent: str
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    permissions: List[str]
    romanian_locale: bool
    mfa_verified: bool
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.now() > self.expires_at
    
    def is_inactive(self, timeout_minutes: int = 30) -> bool:
        """Check if session is inactive"""
        return datetime.now() > self.last_activity + timedelta(minutes=timeout_minutes)


@dataclass
class SecurityPolicy:
    """Security policy configuration"""
    policy_id: str
    name: str
    description: str
    policy_type: str
    rules: List[Dict[str, Any]]
    enabled: bool
    romanian_specific: bool
    compliance_framework: Optional[str]


@dataclass
class ThreatSignature:
    """Threat detection signature"""
    signature_id: str
    name: str
    pattern: str
    threat_type: str
    severity: str
    description: str
    active: bool
    false_positive_rate: float


class EncryptionManager:
    """Advanced encryption management (simplified for demo)"""
    
    def __init__(self):
        self.master_key = self._generate_master_key()
        if CRYPTOGRAPHY_AVAILABLE:
            self.fernet = Fernet(Fernet.generate_key())
        
    def _generate_master_key(self) -> str:
        """Generate master encryption key"""
        return secrets.token_urlsafe(32)
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt data"""
        try:
            if CRYPTOGRAPHY_AVAILABLE:
                encrypted = self.fernet.encrypt(data.encode('utf-8'))
                return base64.b64encode(encrypted).decode('utf-8')
            else:
                # Simple base64 encoding for demo (NOT secure for production)
                encoded = base64.b64encode(data.encode('utf-8')).decode('utf-8')
                return f"simple:{encoded}"
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt data"""
        try:
            if encrypted_data.startswith("simple:"):
                # Simple base64 decoding for demo
                encoded_data = encrypted_data[7:]  # Remove "simple:" prefix
                decoded = base64.b64decode(encoded_data.encode('utf-8')).decode('utf-8')
                return decoded
            elif CRYPTOGRAPHY_AVAILABLE:
                # Use Fernet decryption
                encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
                decrypted = self.fernet.decrypt(encrypted_bytes)
                return decrypted.decode('utf-8')
            else:
                # Try base64 decoding directly
                decoded = base64.b64decode(encrypted_data.encode('utf-8')).decode('utf-8')
                return decoded
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise
    
    def encrypt_rsa(self, data: str) -> str:
        """RSA encryption (demo implementation)"""
        try:
            # Use simple base64 for demo
            return base64.b64encode(data.encode('utf-8')).decode('utf-8')
        except Exception as e:
            logger.error(f"RSA encryption failed: {e}")
            raise
    
    def decrypt_rsa(self, encrypted_data: str) -> str:
        """RSA decryption (demo implementation)"""
        try:
            # Use simple base64 for demo
            return base64.b64decode(encrypted_data.encode('utf-8')).decode('utf-8')
        except Exception as e:
            logger.error(f"RSA decryption failed: {e}")
            raise
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256 (demo only)"""
        try:
            if BCRYPT_AVAILABLE:
                salt = bcrypt.gensalt()
                hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
                return hashed.decode('utf-8')
            else:
                # Simple SHA-256 hash with salt for demo (NOT secure for production)
                salt = secrets.token_hex(16)
                hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
                return f"{salt}:{hashed}"
        except Exception as e:
            logger.error(f"Password hashing failed: {e}")
            raise
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        try:
            if BCRYPT_AVAILABLE and not ':' in hashed:
                return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
            else:
                # Simple SHA-256 verification for demo
                if ':' in hashed:
                    salt, stored_hash = hashed.split(':', 1)
                    computed_hash = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
                    return computed_hash == stored_hash
                return False
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return False


class JWTManager:
    """JWT token management (simplified for demo)"""
    
    def __init__(self, secret_key: str = None):
        self.secret_key = secret_key or secrets.token_urlsafe(32)
        self.algorithm = 'HS256'
        self.access_token_expiry = timedelta(hours=24)  # Longer expiry for testing
        self.refresh_token_expiry = timedelta(days=7)
    
    def create_access_token(self, user_id: str, permissions: List[str] = None, 
                          romanian_locale: bool = False) -> str:
        """Create JWT access token (demo implementation)"""
        now = datetime.utcnow()
        payload = {
            'user_id': user_id,
            'permissions': permissions or [],
            'romanian_locale': romanian_locale,
            'iat': now.timestamp(),
            'exp': (now + self.access_token_expiry).timestamp(),
            'type': 'access'
        }
        
        try:
            if JWT_AVAILABLE:
                token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
                return token
            else:
                # Simple base64 encoding for demo (NOT secure for production)
                token_data = json.dumps(payload)
                token = base64.b64encode(token_data.encode('utf-8')).decode('utf-8')
                return f"demo.{token}.signature"
        except Exception as e:
            logger.error(f"Access token creation failed: {e}")
            raise
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token (demo implementation)"""
        now = datetime.utcnow()
        payload = {
            'user_id': user_id,
            'iat': now.timestamp(),
            'exp': (now + self.refresh_token_expiry).timestamp(),
            'type': 'refresh'
        }
        
        try:
            if JWT_AVAILABLE:
                token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
                return token
            else:
                # Simple base64 encoding for demo
                token_data = json.dumps(payload)
                token = base64.b64encode(token_data.encode('utf-8')).decode('utf-8')
                return f"demo.{token}.signature"
        except Exception as e:
            logger.error(f"Refresh token creation failed: {e}")
            raise
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token (demo implementation)"""
        try:
            if JWT_AVAILABLE and not token.startswith("demo."):
                payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
                return payload
            else:
                # Simple base64 decoding for demo
                if token.startswith("demo."):
                    parts = token.split('.')
                    if len(parts) >= 2:
                        token_data = base64.b64decode(parts[1].encode('utf-8')).decode('utf-8')
                        payload = json.loads(token_data)
                        
                        # Check expiration
                        if payload.get('exp', 0) < datetime.utcnow().timestamp():
                            raise ValueError("Token has expired")
                        
                        return payload
                raise ValueError("Invalid token format")
        except Exception as e:
            if "expired" in str(e):
                raise ValueError("Token has expired")
            raise ValueError(f"Invalid token: {e}")
    
    def refresh_access_token(self, refresh_token: str, permissions: List[str] = None) -> str:
        """Create new access token from refresh token"""
        try:
            payload = self.verify_token(refresh_token)
            
            if payload.get('type') != 'refresh':
                raise ValueError("Invalid token type")
            
            return self.create_access_token(
                payload['user_id'], 
                permissions, 
                payload.get('romanian_locale', False)
            )
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            raise


class ThreatDetector:
    """Advanced threat detection system"""
    
    def __init__(self):
        self.threat_signatures = self._load_threat_signatures()
        self.ip_blacklist = set()
        self.failed_attempts = defaultdict(int)
        self.rate_limits = defaultdict(deque)
        self.romanian_specific_threats = self._load_romanian_threats()
        
    def _load_threat_signatures(self) -> List[ThreatSignature]:
        """Load threat detection signatures"""
        signatures = [
            ThreatSignature(
                "sql_injection", "SQL Injection", 
                r"(\bunion\b.*\bselect\b)|(\bselect\b.*\bfrom\b)|(\binsert\b.*\binto\b)|(\bdelete\b.*\bfrom\b)|(\bdrop\b.*\btable\b)",
                "injection", "high", "SQL injection attempt detected", True, 0.05
            ),
            ThreatSignature(
                "xss_attack", "Cross-Site Scripting",
                r"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|on\w+\s*=",
                "injection", "high", "XSS attack attempt detected", True, 0.03
            ),
            ThreatSignature(
                "directory_traversal", "Directory Traversal",
                r"(\.\./)|(%2e%2e%2f)|(\.\.\%5c)|(%2e%2e%5c)",
                "traversal", "medium", "Directory traversal attempt detected", True, 0.02
            ),
            ThreatSignature(
                "brute_force", "Brute Force Attack",
                r"password|passwd|login|admin|root",
                "brute_force", "medium", "Potential brute force attempt", True, 0.10
            ),
            ThreatSignature(
                "command_injection", "Command Injection",
                r"(\bcurl\b)|(\bwget\b)|(\bpowershell\b)|(\bcmd\b)|(\bsh\b)|(\bbash\b)",
                "injection", "high", "Command injection attempt detected", True, 0.08
            )
        ]
        return signatures
    
    def _load_romanian_threats(self) -> List[ThreatSignature]:
        """Load Romanian-specific threat signatures"""
        signatures = [
            ThreatSignature(
                "romanian_social_eng", "Romanian Social Engineering",
                r"(CNP|CUI|numărul\s+de\s+telefon|adresa\s+de\s+email|parola|contul\s+bancar)",
                "social_engineering", "high", "Romanian social engineering attempt", True, 0.02
            ),
            ThreatSignature(
                "romanian_phishing", "Romanian Phishing",
                r"(Banca\s+Transilvania|BCR|BRD|ING\s+Bank|Raiffeisen|CEC\s+Bank)",
                "phishing", "high", "Romanian banking phishing attempt", True, 0.01
            ),
            ThreatSignature(
                "romanian_spam", "Romanian Spam",
                r"(câștigi|premiu|concurs|urgent|rapid|gratuit|fără\s+taxe)",
                "spam", "low", "Romanian spam content detected", True, 0.15
            )
        ]
        return signatures
    
    def detect_threats(self, input_data: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Detect threats in input data"""
        threats = []
        
        try:
            # Check against all threat signatures
            all_signatures = self.threat_signatures + self.romanian_specific_threats
            
            for signature in all_signatures:
                if not signature.active:
                    continue
                    
                if re.search(signature.pattern, input_data, re.IGNORECASE):
                    threat = {
                        'signature_id': signature.signature_id,
                        'name': signature.name,
                        'type': signature.threat_type,
                        'severity': signature.severity,
                        'description': signature.description,
                        'matched_pattern': signature.pattern,
                        'confidence': 1.0 - signature.false_positive_rate,
                        'timestamp': datetime.now(),
                        'context': context or {}
                    }
                    threats.append(threat)
            
            # Additional contextual analysis
            if context:
                # Rate limiting check
                ip_address = context.get('ip_address')
                if ip_address and self._is_rate_limited(ip_address):
                    threats.append({
                        'signature_id': 'rate_limit_exceeded',
                        'name': 'Rate Limit Exceeded',
                        'type': 'rate_limiting',
                        'severity': 'medium',
                        'description': f'Rate limit exceeded for IP {ip_address}',
                        'confidence': 0.95,
                        'timestamp': datetime.now(),
                        'context': context
                    })
                
                # IP blacklist check
                if ip_address and ip_address in self.ip_blacklist:
                    threats.append({
                        'signature_id': 'blacklisted_ip',
                        'name': 'Blacklisted IP',
                        'type': 'ip_reputation',
                        'severity': 'high',
                        'description': f'Request from blacklisted IP {ip_address}',
                        'confidence': 1.0,
                        'timestamp': datetime.now(),
                        'context': context
                    })
            
            return threats
            
        except Exception as e:
            logger.error(f"Threat detection failed: {e}")
            return []
    
    def _is_rate_limited(self, ip_address: str, limit: int = 100, window_seconds: int = 60) -> bool:
        """Check if IP is rate limited"""
        now = time.time()
        window_start = now - window_seconds
        
        # Clean old entries
        while self.rate_limits[ip_address] and self.rate_limits[ip_address][0] < window_start:
            self.rate_limits[ip_address].popleft()
        
        # Check current rate
        current_requests = len(self.rate_limits[ip_address])
        
        if current_requests >= limit:
            return True
        
        # Add current request
        self.rate_limits[ip_address].append(now)
        return False
    
    def add_to_blacklist(self, ip_address: str):
        """Add IP to blacklist"""
        try:
            # Validate IP address
            ipaddress.ip_address(ip_address)
            self.ip_blacklist.add(ip_address)
            logger.info(f"Added {ip_address} to blacklist")
        except ValueError:
            logger.error(f"Invalid IP address: {ip_address}")
    
    def remove_from_blacklist(self, ip_address: str):
        """Remove IP from blacklist"""
        if ip_address in self.ip_blacklist:
            self.ip_blacklist.remove(ip_address)
            logger.info(f"Removed {ip_address} from blacklist")


class InputValidator:
    """Advanced input validation and sanitization"""
    
    def __init__(self):
        self.romanian_chars = set('aăâbcdefghiîjklmnopqrsștțuvwxyzAĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVWXYZ')
        self.allowed_html_tags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']
        
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def validate_romanian_phone(self, phone: str) -> bool:
        """Validate Romanian phone number"""
        # Romanian phone number formats
        patterns = [
            r'^\+40[0-9]{9}$',  # +40 followed by 9 digits
            r'^0[0-9]{9}$',     # 0 followed by 9 digits
            r'^[0-9]{10}$'      # 10 digits
        ]
        
        clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
        return any(bool(re.match(pattern, clean_phone)) for pattern in patterns)
    
    def validate_romanian_cnp(self, cnp: str) -> bool:
        """Validate Romanian CNP (Personal Numeric Code)"""
        if not cnp or len(cnp) != 13 or not cnp.isdigit():
            return False
        
        # Check birth date validity
        year = int(cnp[1:3])
        month = int(cnp[3:5])
        day = int(cnp[5:7])
        
        if month < 1 or month > 12:
            return False
        if day < 1 or day > 31:
            return False
        
        # Check control digit
        weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
        checksum = sum(int(cnp[i]) * weights[i] for i in range(12))
        control_digit = checksum % 11
        if control_digit == 10:
            control_digit = 1
        
        return int(cnp[12]) == control_digit
    
    def sanitize_html(self, html_content: str) -> str:
        """Sanitize HTML content (demo implementation)"""
        try:
            if BLEACH_AVAILABLE:
                return bleach.clean(
                    html_content,
                    tags=self.allowed_html_tags,
                    attributes={},
                    strip=True
                )
            else:
                # Simple HTML sanitization for demo
                # Remove script tags and dangerous attributes
                sanitized = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.IGNORECASE | re.DOTALL)
                sanitized = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', sanitized, flags=re.IGNORECASE)
                sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)
                return sanitized
        except Exception as e:
            logger.error(f"HTML sanitization failed: {e}")
            return ""
    
    def validate_romanian_text(self, text: str, max_length: int = 1000) -> Dict[str, Any]:
        """Validate Romanian text input"""
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'sanitized_text': text
        }
        
        try:
            # Length check
            if len(text) > max_length:
                result['valid'] = False
                result['errors'].append(f"Text exceeds maximum length of {max_length}")
            
            # Character validation for Romanian
            invalid_chars = set(text) - self.romanian_chars - set(' .,!?;:()-"\'0123456789')
            if invalid_chars:
                result['warnings'].append(f"Non-Romanian characters detected: {invalid_chars}")
            
            # Basic sanitization
            result['sanitized_text'] = self.sanitize_html(text)
            
            # Romanian diacritics check
            romanian_diacritics = set('ăâîșț')
            has_diacritics = any(char in romanian_diacritics for char in text.lower())
            if not has_diacritics and len(text) > 20:
                result['warnings'].append("Text may be missing Romanian diacritics")
            
            return result
            
        except Exception as e:
            logger.error(f"Romanian text validation failed: {e}")
            result['valid'] = False
            result['errors'].append(f"Validation error: {e}")
            return result


class ComplianceManager:
    """Security compliance management"""
    
    def __init__(self):
        self.gdpr_enabled = True
        self.romanian_data_protection_enabled = True
        self.audit_log = deque(maxlen=10000)
        
    def check_gdpr_compliance(self, data_operation: Dict[str, Any]) -> Dict[str, Any]:
        """Check GDPR compliance for data operations"""
        compliance_result = {
            'compliant': True,
            'issues': [],
            'recommendations': []
        }
        
        try:
            # Check for personal data processing
            personal_data_types = ['email', 'phone', 'cnp', 'address', 'name']
            
            if any(data_type in data_operation.get('data_types', []) for data_type in personal_data_types):
                # Check for consent
                if not data_operation.get('consent_given', False):
                    compliance_result['compliant'] = False
                    compliance_result['issues'].append("Processing personal data without explicit consent")
                
                # Check for lawful basis
                if not data_operation.get('lawful_basis'):
                    compliance_result['compliant'] = False
                    compliance_result['issues'].append("No lawful basis specified for processing")
                
                # Check for purpose limitation
                if not data_operation.get('processing_purpose'):
                    compliance_result['issues'].append("Processing purpose not specified")
                
                # Check for data minimization
                if data_operation.get('data_retention_days', 0) > 2555:  # 7 years
                    compliance_result['recommendations'].append("Consider shorter data retention period")
            
            # Romanian-specific compliance
            if self.romanian_data_protection_enabled:
                if 'cnp' in data_operation.get('data_types', []):
                    if not data_operation.get('romanian_dpa_notification', False):
                        compliance_result['recommendations'].append("Consider notifying Romanian DPA for CNP processing")
            
            return compliance_result
            
        except Exception as e:
            logger.error(f"GDPR compliance check failed: {e}")
            compliance_result['compliant'] = False
            compliance_result['issues'].append(f"Compliance check error: {e}")
            return compliance_result
    
    def log_audit_event(self, event: Dict[str, Any]):
        """Log audit event"""
        try:
            audit_entry = {
                'timestamp': datetime.now().isoformat(),
                'event_id': secrets.token_hex(8),
                **event
            }
            self.audit_log.append(audit_entry)
            logger.info(f"Audit event logged: {event.get('action', 'unknown')}")
        except Exception as e:
            logger.error(f"Audit logging failed: {e}")


class EnterpriseSecurityManager:
    """Main enterprise security manager for Romanian AI systems"""
    
    def __init__(self, db_path: str = "enterprise_security.db"):
        self.db_path = Path(db_path)
        self.encryption_manager = EncryptionManager()
        self.jwt_manager = JWTManager()
        self.threat_detector = ThreatDetector()
        self.input_validator = InputValidator()
        self.compliance_manager = ComplianceManager()
        
        # Security state
        self.active_sessions = {}
        self.security_events = deque(maxlen=5000)
        self.security_policies = self._load_security_policies()
        
        # Initialize database
        self._init_database()
        logger.info("Enterprise Security Manager initialized")
    
    def _init_database(self):
        """Initialize security database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Security events table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS security_events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_id TEXT UNIQUE NOT NULL,
                        timestamp TEXT NOT NULL,
                        event_type TEXT NOT NULL,
                        severity TEXT NOT NULL,
                        source_ip TEXT,
                        user_id TEXT,
                        description TEXT NOT NULL,
                        details TEXT,
                        resolved BOOLEAN DEFAULT FALSE,
                        resolution_time TEXT
                    )
                """)
                
                # User sessions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        session_id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        ip_address TEXT NOT NULL,
                        user_agent TEXT,
                        created_at TEXT NOT NULL,
                        last_activity TEXT NOT NULL,
                        expires_at TEXT NOT NULL,
                        permissions TEXT,
                        romanian_locale BOOLEAN DEFAULT FALSE,
                        mfa_verified BOOLEAN DEFAULT FALSE
                    )
                """)
                
                # Audit log table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS audit_log (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        event_id TEXT NOT NULL,
                        user_id TEXT,
                        action TEXT NOT NULL,
                        resource TEXT,
                        ip_address TEXT,
                        details TEXT,
                        success BOOLEAN DEFAULT TRUE
                    )
                """)
                
                conn.commit()
                logger.info("Security database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize security database: {e}")
            raise
    
    def _load_security_policies(self) -> List[SecurityPolicy]:
        """Load security policies"""
        policies = [
            SecurityPolicy(
                "password_policy", "Password Policy",
                "Strong password requirements",
                "authentication",
                [
                    {"min_length": 12},
                    {"require_uppercase": True},
                    {"require_lowercase": True},
                    {"require_numbers": True},
                    {"require_special_chars": True},
                    {"max_age_days": 90}
                ],
                True, False, "ISO27001"
            ),
            SecurityPolicy(
                "session_policy", "Session Management Policy",
                "Session timeout and security requirements",
                "session",
                [
                    {"max_session_duration_hours": 8},
                    {"idle_timeout_minutes": 30},
                    {"require_mfa": True},
                    {"ip_binding": True}
                ],
                True, False, "GDPR"
            ),
            SecurityPolicy(
                "romanian_data_policy", "Romanian Data Protection Policy",
                "Romanian-specific data protection requirements",
                "data_protection",
                [
                    {"cnp_processing_consent": True},
                    {"data_localization": True},
                    {"romanian_dpa_compliance": True},
                    {"cross_border_transfer_restrictions": True}
                ],
                True, True, "Romanian DPA"
            )
        ]
        return policies
    
    async def authenticate_user(self, username: str, password: str, 
                              ip_address: str, user_agent: str = None) -> Dict[str, Any]:
        """Authenticate user and create session"""
        try:
            # Log authentication attempt
            self.compliance_manager.log_audit_event({
                'action': 'authentication_attempt',
                'user_id': username,
                'ip_address': ip_address,
                'user_agent': user_agent
            })
            
            # Check for threats in authentication
            threat_context = {
                'ip_address': ip_address,
                'user_agent': user_agent,
                'action': 'authentication'
            }
            
            threats = self.threat_detector.detect_threats(username + password, threat_context)
            
            if threats:
                high_severity_threats = [t for t in threats if t['severity'] == 'high']
                if high_severity_threats:
                    await self._create_security_event(
                        "authentication_threat", "high", ip_address, username,
                        "High severity threats detected during authentication",
                        {'threats': high_severity_threats}
                    )
                    return {'success': False, 'error': 'Authentication blocked due to security threats'}
            
            # Simulate user validation (in production, check against user database)
            user_valid = self._validate_user_credentials(username, password)
            
            if not user_valid:
                self.threat_detector.failed_attempts[ip_address] += 1
                
                await self._create_security_event(
                    "failed_authentication", "medium", ip_address, username,
                    "Failed authentication attempt",
                    {'attempt_count': self.threat_detector.failed_attempts[ip_address]}
                )
                
                return {'success': False, 'error': 'Invalid credentials'}
            
            # Create session
            session = await self._create_user_session(username, ip_address, user_agent)
            
            # Create JWT tokens
            permissions = self._get_user_permissions(username)
            romanian_locale = self._is_romanian_user(username)
            
            access_token = self.jwt_manager.create_access_token(
                username, permissions, romanian_locale
            )
            refresh_token = self.jwt_manager.create_refresh_token(username)
            
            # Log successful authentication
            self.compliance_manager.log_audit_event({
                'action': 'authentication_success',
                'user_id': username,
                'ip_address': ip_address,
                'session_id': session.session_id
            })
            
            return {
                'success': True,
                'session_id': session.session_id,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'permissions': permissions,
                'romanian_locale': romanian_locale,
                'expires_at': session.expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            await self._create_security_event(
                "authentication_error", "high", ip_address, username,
                f"Authentication system error: {str(e)}", {}
            )
            return {'success': False, 'error': 'Authentication system error'}
    
    def _validate_user_credentials(self, username: str, password: str) -> bool:
        """Validate user credentials (mock implementation)"""
        # In production, this would check against a secure user database
        mock_users = {
            'admin': self.encryption_manager.hash_password('RomAI2025!'),
            'user': self.encryption_manager.hash_password('User123!'),
            'testuser': self.encryption_manager.hash_password('Test123!')
        }
        
        if username in mock_users:
            return self.encryption_manager.verify_password(password, mock_users[username])
        
        return False
    
    def _get_user_permissions(self, username: str) -> List[str]:
        """Get user permissions (mock implementation)"""
        permission_map = {
            'admin': ['read', 'write', 'delete', 'admin', 'romanian_admin'],
            'user': ['read', 'write', 'romanian_user'],
            'testuser': ['read']
        }
        return permission_map.get(username, ['read'])
    
    def _is_romanian_user(self, username: str) -> bool:
        """Check if user prefers Romanian locale"""
        # Simple heuristic for demo
        romanian_users = ['admin', 'user']
        return username in romanian_users
    
    async def _create_user_session(self, user_id: str, ip_address: str, 
                                 user_agent: str = None) -> UserSession:
        """Create new user session"""
        session_id = secrets.token_urlsafe(32)
        now = datetime.now()
        expires_at = now + timedelta(hours=8)  # 8-hour session
        
        session = UserSession(
            session_id=session_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent or '',
            created_at=now,
            last_activity=now,
            expires_at=expires_at,
            permissions=self._get_user_permissions(user_id),
            romanian_locale=self._is_romanian_user(user_id),
            mfa_verified=False  # Would be set after MFA verification
        )
        
        self.active_sessions[session_id] = session
        
        # Store in database
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO user_sessions 
                    (session_id, user_id, ip_address, user_agent, created_at, 
                     last_activity, expires_at, permissions, romanian_locale, mfa_verified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session.session_id, session.user_id, session.ip_address,
                    session.user_agent, session.created_at.isoformat(),
                    session.last_activity.isoformat(), session.expires_at.isoformat(),
                    json.dumps(session.permissions), session.romanian_locale,
                    session.mfa_verified
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to store session: {e}")
        
        return session
    
    async def _create_security_event(self, event_type: str, severity: str, 
                                   source_ip: str, user_id: str, description: str,
                                   details: Dict[str, Any]):
        """Create security event"""
        event_id = secrets.token_hex(8)
        event = SecurityEvent(
            event_id=event_id,
            timestamp=datetime.now(),
            event_type=event_type,
            severity=severity,
            source_ip=source_ip,
            user_id=user_id,
            description=description,
            details=details,
            resolved=False,
            resolution_time=None
        )
        
        self.security_events.append(event)
        
        # Store in database
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO security_events 
                    (event_id, timestamp, event_type, severity, source_ip, user_id, 
                     description, details, resolved, resolution_time)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.event_id, event.timestamp.isoformat(), event.event_type,
                    event.severity, event.source_ip, event.user_id, event.description,
                    json.dumps(event.details), event.resolved,
                    event.resolution_time.isoformat() if event.resolution_time else None
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to store security event: {e}")
        
        logger.warning(f"Security event created: {event_type} - {description}")
    
    async def validate_request(self, request_data: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate incoming request for security threats"""
        try:
            # Threat detection
            threats = self.threat_detector.detect_threats(request_data, context)
            
            # Input validation
            validation_result = self.input_validator.validate_romanian_text(request_data)
            
            # Check session validity
            session_valid = True
            session_id = context.get('session_id')
            if session_id:
                session = self.active_sessions.get(session_id)
                if not session or session.is_expired() or session.is_inactive():
                    session_valid = False
            
            result = {
                'valid': len(threats) == 0 and validation_result['valid'] and session_valid,
                'threats': threats,
                'validation_result': validation_result,
                'session_valid': session_valid,
                'sanitized_input': validation_result.get('sanitized_text', request_data)
            }
            
            # Log high-severity threats
            high_threats = [t for t in threats if t['severity'] == 'high']
            if high_threats:
                await self._create_security_event(
                    "request_threat", "high", context.get('ip_address', 'unknown'),
                    context.get('user_id'), "High severity threats in request",
                    {'threats': high_threats, 'request_data': request_data[:200]}
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Request validation failed: {e}")
            return {
                'valid': False,
                'error': str(e),
                'threats': [],
                'validation_result': {'valid': False, 'errors': [str(e)]},
                'session_valid': False
            }
    
    def get_security_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get security summary for the last N hours"""
        try:
            since_time = datetime.now() - timedelta(hours=hours)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Security events summary
                cursor.execute("""
                    SELECT severity, COUNT(*) as count
                    FROM security_events 
                    WHERE timestamp > ?
                    GROUP BY severity
                """, (since_time.isoformat(),))
                
                events_by_severity = dict(cursor.fetchall())
                
                # Active sessions count
                cursor.execute("""
                    SELECT COUNT(*) as count
                    FROM user_sessions 
                    WHERE expires_at > ? AND last_activity > ?
                """, (datetime.now().isoformat(), since_time.isoformat()))
                
                active_sessions_count = cursor.fetchone()[0]
                
                # Authentication attempts
                cursor.execute("""
                    SELECT success, COUNT(*) as count
                    FROM audit_log 
                    WHERE action LIKE '%authentication%' AND timestamp > ?
                    GROUP BY success
                """, (since_time.isoformat(),))
                
                auth_stats = dict(cursor.fetchall())
                
                summary = {
                    'period_hours': hours,
                    'security_events': {
                        'total': sum(events_by_severity.values()),
                        'by_severity': events_by_severity
                    },
                    'active_sessions': active_sessions_count,
                    'authentication': {
                        'successful': auth_stats.get(1, 0),
                        'failed': auth_stats.get(0, 0)
                    },
                    'blacklisted_ips': len(self.threat_detector.ip_blacklist),
                    'threat_signatures_active': len([s for s in self.threat_detector.threat_signatures if s.active])
                }
                
                return summary
                
        except Exception as e:
            logger.error(f"Failed to get security summary: {e}")
            return {'error': str(e)}


async def test_enterprise_security_manager():
    """Test the enterprise security manager"""
    try:
        print("🔒 Testing Enterprise Security Manager...")
        
        security_manager = EnterpriseSecurityManager("test_enterprise_security.db")
        
        # Test 1: Authentication
        print("\n1. Testing user authentication...")
        auth_result = await security_manager.authenticate_user(
            "testuser", "Test123!", "192.168.1.100", "Test User Agent"
        )
        print(f"Authentication result: {json.dumps(auth_result, indent=2)}")
        assert auth_result['success'] == True
        print("✅ Authentication test passed")
        
        # Test 2: Threat detection
        print("\n2. Testing threat detection...")
        malicious_input = "SELECT * FROM users; DROP TABLE users; <script>alert('xss')</script>"
        threats = security_manager.threat_detector.detect_threats(
            malicious_input,
            {'ip_address': '192.168.1.100', 'user_id': 'testuser'}
        )
        print(f"Detected threats: {len(threats)}")
        for threat in threats:
            print(f"  - {threat['name']}: {threat['severity']}")
        assert len(threats) > 0
        print("✅ Threat detection test passed")
        
        # Test 3: Input validation
        print("\n3. Testing input validation...")
        romanian_text = "Bună ziua! Acesta este un text în română cu diacritice: ăâîșț"
        validation_result = security_manager.input_validator.validate_romanian_text(romanian_text)
        print(f"Romanian text validation: {json.dumps(validation_result, indent=2)}")
        assert validation_result['valid'] == True
        print("✅ Input validation test passed")
        
        # Test 4: Request validation
        print("\n4. Testing request validation...")
        request_validation = await security_manager.validate_request(
            "Normal Romanian text: Salut, cum ești?",
            {'ip_address': '192.168.1.100', 'user_id': 'testuser'}
        )
        print(f"Request validation: {json.dumps(request_validation, indent=2)}")
        assert request_validation['valid'] == True
        print("✅ Request validation test passed")
        
        # Test 5: Encryption/Decryption
        print("\n5. Testing encryption...")
        test_data = "Sensitive Romanian data: Informații confidențiale"
        encrypted = security_manager.encryption_manager.encrypt_data(test_data)
        decrypted = security_manager.encryption_manager.decrypt_data(encrypted)
        print(f"Original: {test_data}")
        print(f"Encrypted: {encrypted[:50]}...")
        print(f"Decrypted: {decrypted}")
        assert decrypted == test_data
        print("✅ Encryption test passed")
        
        # Test 6: JWT tokens
        print("\n6. Testing JWT tokens...")
        access_token = security_manager.jwt_manager.create_access_token(
            "testuser", ["read", "write"], True
        )
        token_payload = security_manager.jwt_manager.verify_token(access_token)
        print(f"Token payload: {json.dumps(token_payload, indent=2)}")
        assert token_payload['user_id'] == "testuser"
        print("✅ JWT token test passed")
        
        # Test 7: Security summary
        print("\n7. Testing security summary...")
        # Give time for events to be recorded
        await asyncio.sleep(1)
        summary = security_manager.get_security_summary(hours=1)
        print(f"Security summary: {json.dumps(summary, indent=2)}")
        assert 'security_events' in summary
        print("✅ Security summary test passed")
        
        print("\n🎉 All tests passed! Enterprise Security Manager is working correctly.")
        
        return {
            'status': 'success',
            'tests_passed': 7,
            'authentication_result': auth_result,
            'threats_detected': len(threats),
            'validation_passed': validation_result['valid'],
            'security_summary': summary
        }
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return {'status': 'error', 'message': str(e)}


if __name__ == "__main__":
    # Run the test
    result = asyncio.run(test_enterprise_security_manager())
    print(f"\nFinal result: {json.dumps(result, indent=2)}")
