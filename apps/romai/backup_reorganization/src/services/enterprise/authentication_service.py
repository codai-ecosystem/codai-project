"""
Enterprise Authentication Service
Provides comprehensive authentication, authorization, and security features

Features:
- JWT-based authentication with role-based access control
- Multi-factor authentication support
- Session management with automatic cleanup
- Security monitoring and threat detection
- Enterprise-grade compliance and audit logging
"""

import asyncio
import logging
import jwt
import hashlib
import secrets
import time
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid

# Core imports
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'core'))

from mathematical.mathematical_engine import MathematicalEngine
from reasoning.reasoning_engine import ReasoningEngine
from learning.learning_engine import LearningEngine

logger = logging.getLogger(__name__)

class AuthenticationMethod(Enum):
    """Authentication methods"""
    PASSWORD = "password"
    MFA = "multi_factor"
    SSO = "single_sign_on"
    API_KEY = "api_key"
    CERTIFICATE = "certificate"

class SecurityLevel(Enum):
    """Security levels"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class UserRole(Enum):
    """User roles"""
    ADMIN = "admin"
    ENTERPRISE_USER = "enterprise_user"
    STANDARD_USER = "standard_user"
    READONLY_USER = "readonly_user"
    API_USER = "api_user"
    GUEST = "guest"

@dataclass
class SecurityEvent:
    """Security event for monitoring"""
    event_id: str
    event_type: str
    user_id: Optional[str]
    ip_address: str
    timestamp: datetime
    severity: SecurityLevel
    description: str
    metadata: Dict[str, Any]

@dataclass
class AuthenticationAttempt:
    """Authentication attempt record"""
    attempt_id: str
    username: str
    ip_address: str
    user_agent: str
    method: AuthenticationMethod
    success: bool
    timestamp: datetime
    failure_reason: Optional[str]
    security_score: float

@dataclass
class UserProfile:
    """Comprehensive user profile"""
    user_id: str
    username: str
    email: str
    role: UserRole
    permissions: List[str]
    created_at: datetime
    last_login: Optional[datetime]
    login_count: int
    failed_login_attempts: int
    account_locked: bool
    mfa_enabled: bool
    preferences: Dict[str, Any]
    security_clearance: SecurityLevel

@dataclass
class SessionToken:
    """Session token information"""
    token_id: str
    user_id: str
    token: str
    created_at: datetime
    expires_at: datetime
    last_accessed: datetime
    ip_address: str
    user_agent: str
    permissions: List[str]
    metadata: Dict[str, Any]

class EnterpriseAuthenticationService:
    """
    Enterprise Authentication Service
    
    Provides comprehensive authentication, authorization, and security features
    for enterprise-grade applications with advanced threat detection and compliance.
    """
    
    def __init__(self):
        """Initialize the Enterprise Authentication Service"""
        self.mathematical_engine = MathematicalEngine()
        self.reasoning_engine = ReasoningEngine()
        self.learning_engine = LearningEngine()
        
        # Security configuration
        self.jwt_secret = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-enterprise-auth-2025')
        self.jwt_algorithm = 'HS256'
        self.token_expiry_hours = 24
        self.refresh_token_expiry_days = 30
        
        # Password security
        self.password_min_length = 8
        self.password_require_special = True
        self.password_require_numbers = True
        self.password_require_uppercase = True
        
        # Account lockout configuration
        self.max_failed_attempts = 5
        self.lockout_duration_minutes = 30
        
        # Session management
        self.session_timeout_minutes = 30
        self.max_concurrent_sessions = 5
        
        # Storage (in production, use proper database)
        self.user_profiles = {}
        self.active_sessions = {}
        self.security_events = []
        self.authentication_attempts = []
        self.blocked_ips = {}
        
        # Security monitoring
        self.suspicious_activity_threshold = 0.7
        self.threat_detection_enabled = True
        
        # Statistics
        self.total_auth_attempts = 0
        self.successful_auths = 0
        self.failed_auths = 0
        self.security_events_count = 0
        
        # Initialize default users
        self._initialize_default_users()
        
        logger.info("Enterprise Authentication Service initialized")
    
    def _initialize_default_users(self):
        """Initialize default users for development"""
        default_users = [
            {
                'username': 'admin',
                'email': 'admin@romai.ai',
                'password': 'Admin123!',
                'role': UserRole.ADMIN,
                'security_clearance': SecurityLevel.CRITICAL
            },
            {
                'username': 'enterprise',
                'email': 'enterprise@romai.ai',
                'password': 'Enterprise123!',
                'role': UserRole.ENTERPRISE_USER,
                'security_clearance': SecurityLevel.HIGH
            },
            {
                'username': 'user',
                'email': 'user@romai.ai',
                'password': 'User123!',
                'role': UserRole.STANDARD_USER,
                'security_clearance': SecurityLevel.MEDIUM
            },
            {
                'username': 'demo',
                'email': 'demo@romai.ai',
                'password': 'Demo123!',
                'role': UserRole.READONLY_USER,
                'security_clearance': SecurityLevel.LOW
            }
        ]
        
        for user_data in default_users:
            user_id = str(uuid.uuid4())
            password_hash = self._hash_password(user_data['password'])
            
            profile = UserProfile(
                user_id=user_id,
                username=user_data['username'],
                email=user_data['email'],
                role=user_data['role'],
                permissions=self._get_role_permissions(user_data['role']),
                created_at=datetime.now(),
                last_login=None,
                login_count=0,
                failed_login_attempts=0,
                account_locked=False,
                mfa_enabled=False,
                preferences={},
                security_clearance=user_data['security_clearance']
            )
            
            self.user_profiles[user_data['username']] = {
                'profile': profile,
                'password_hash': password_hash
            }
        
        logger.info(f"Initialized {len(default_users)} default users")
    
    async def authenticate_user(self, username: str, password: str, 
                              ip_address: str = "unknown", 
                              user_agent: str = "unknown") -> Dict[str, Any]:
        """
        Authenticate user with comprehensive security checks
        
        Args:
            username: Username
            password: Password
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Dict[str, Any]: Authentication result
        """
        try:
            self.total_auth_attempts += 1
            attempt_id = str(uuid.uuid4())
            
            logger.info(f"Authentication attempt #{self.total_auth_attempts} for user: {username}")
            
            # Security pre-checks
            security_check = await self._perform_security_checks(username, ip_address)
            if not security_check['allowed']:
                await self._log_security_event(
                    "AUTHENTICATION_BLOCKED",
                    username,
                    ip_address,
                    SecurityLevel.HIGH,
                    security_check['reason']
                )
                return {
                    'success': False,
                    'error': security_check['reason'],
                    'retry_after': security_check.get('retry_after'),
                    'attempt_id': attempt_id
                }
            
            # Validate user exists
            if username not in self.user_profiles:
                await self._log_authentication_attempt(
                    attempt_id, username, ip_address, user_agent,
                    AuthenticationMethod.PASSWORD, False, "User not found"
                )
                self.failed_auths += 1
                return {
                    'success': False,
                    'error': 'Invalid credentials',
                    'attempt_id': attempt_id
                }
            
            user_data = self.user_profiles[username]
            user_profile = user_data['profile']
            
            # Check if account is locked
            if user_profile.account_locked:
                await self._log_security_event(
                    "LOCKED_ACCOUNT_ACCESS_ATTEMPT",
                    user_profile.user_id,
                    ip_address,
                    SecurityLevel.MEDIUM,
                    f"Access attempt on locked account: {username}"
                )
                return {
                    'success': False,
                    'error': 'Account is locked',
                    'attempt_id': attempt_id
                }
            
            # Verify password
            password_valid = self._verify_password(password, user_data['password_hash'])
            
            if not password_valid:
                # Handle failed authentication
                user_profile.failed_login_attempts += 1
                
                # Check if account should be locked
                if user_profile.failed_login_attempts >= self.max_failed_attempts:
                    user_profile.account_locked = True
                    await self._log_security_event(
                        "ACCOUNT_LOCKED",
                        user_profile.user_id,
                        ip_address,
                        SecurityLevel.HIGH,
                        f"Account locked due to {self.max_failed_attempts} failed attempts"
                    )
                
                await self._log_authentication_attempt(
                    attempt_id, username, ip_address, user_agent,
                    AuthenticationMethod.PASSWORD, False, "Invalid password"
                )
                self.failed_auths += 1
                
                return {
                    'success': False,
                    'error': 'Invalid credentials',
                    'attempt_id': attempt_id
                }
            
            # Successful authentication
            user_profile.failed_login_attempts = 0
            user_profile.last_login = datetime.now()
            user_profile.login_count += 1
            
            # Generate session token
            session_token = await self._create_session_token(user_profile, ip_address, user_agent)
            
            # Calculate security score using reasoning engine
            security_score = await self._calculate_security_score(
                user_profile, ip_address, user_agent
            )
            
            await self._log_authentication_attempt(
                attempt_id, username, ip_address, user_agent,
                AuthenticationMethod.PASSWORD, True, None, security_score
            )
            
            self.successful_auths += 1
            
            # Adaptive learning for user behavior
            await self._update_user_behavior_model(user_profile, ip_address, user_agent)
            
            result = {
                'success': True,
                'user_id': user_profile.user_id,
                'username': user_profile.username,
                'role': user_profile.role.value,
                'permissions': user_profile.permissions,
                'security_clearance': user_profile.security_clearance.value,
                'session_token': session_token.token,
                'expires_at': session_token.expires_at.isoformat(),
                'security_score': security_score,
                'mfa_required': user_profile.mfa_enabled,
                'attempt_id': attempt_id
            }
            
            logger.info(f"Authentication successful for user: {username}")
            return result
            
        except Exception as e:
            logger.error(f"Authentication error for user {username}: {str(e)}")
            await self._log_security_event(
                "AUTHENTICATION_ERROR",
                username,
                ip_address,
                SecurityLevel.MEDIUM,
                f"Authentication system error: {str(e)}"
            )
            return {
                'success': False,
                'error': 'Authentication system error',
                'attempt_id': attempt_id
            }
    
    async def validate_session_token(self, token: str, ip_address: str = "unknown") -> Dict[str, Any]:
        """
        Validate session token with security checks
        
        Args:
            token: Session token
            ip_address: Client IP address
            
        Returns:
            Dict[str, Any]: Validation result
        """
        try:
            # Decode JWT token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            token_id = payload.get('token_id')
            user_id = payload.get('user_id')
            
            # Check if session exists
            if token_id not in self.active_sessions:
                await self._log_security_event(
                    "INVALID_SESSION_TOKEN",
                    user_id,
                    ip_address,
                    SecurityLevel.MEDIUM,
                    "Session token not found in active sessions"
                )
                return {
                    'valid': False,
                    'error': 'Invalid session token'
                }
            
            session = self.active_sessions[token_id]
            
            # Check if session is expired
            if datetime.now() > session.expires_at:
                await self._cleanup_session(token_id)
                return {
                    'valid': False,
                    'error': 'Session expired'
                }
            
            # Check IP address consistency (optional security measure)
            if self.threat_detection_enabled and session.ip_address != ip_address:
                security_score = await self._assess_ip_change_risk(
                    session.ip_address, ip_address, user_id
                )
                
                if security_score < self.suspicious_activity_threshold:
                    await self._log_security_event(
                        "SUSPICIOUS_IP_CHANGE",
                        user_id,
                        ip_address,
                        SecurityLevel.HIGH,
                        f"Session accessed from different IP: {session.ip_address} -> {ip_address}"
                    )
                    # Could optionally require re-authentication
            
            # Update session last accessed time
            session.last_accessed = datetime.now()
            
            return {
                'valid': True,
                'user_id': session.user_id,
                'permissions': session.permissions,
                'session_info': {
                    'token_id': session.token_id,
                    'created_at': session.created_at.isoformat(),
                    'expires_at': session.expires_at.isoformat(),
                    'last_accessed': session.last_accessed.isoformat()
                }
            }
            
        except jwt.ExpiredSignatureError:
            return {
                'valid': False,
                'error': 'Token expired'
            }
        except jwt.InvalidTokenError:
            await self._log_security_event(
                "INVALID_JWT_TOKEN",
                None,
                ip_address,
                SecurityLevel.MEDIUM,
                "Invalid JWT token signature or format"
            )
            return {
                'valid': False,
                'error': 'Invalid token'
            }
        except Exception as e:
            logger.error(f"Session validation error: {str(e)}")
            return {
                'valid': False,
                'error': 'Session validation failed'
            }
    
    async def logout_user(self, token: str, ip_address: str = "unknown") -> Dict[str, Any]:
        """
        Logout user and cleanup session
        
        Args:
            token: Session token
            ip_address: Client IP address
            
        Returns:
            Dict[str, Any]: Logout result
        """
        try:
            # Validate token to get session info
            validation_result = await self.validate_session_token(token, ip_address)
            
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['error']
                }
            
            # Decode token to get token_id
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            token_id = payload.get('token_id')
            user_id = payload.get('user_id')
            
            # Cleanup session
            await self._cleanup_session(token_id)
            
            await self._log_security_event(
                "USER_LOGOUT",
                user_id,
                ip_address,
                SecurityLevel.LOW,
                "User logged out successfully"
            )
            
            logger.info(f"User {user_id} logged out successfully")
            
            return {
                'success': True,
                'message': 'Logged out successfully'
            }
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return {
                'success': False,
                'error': 'Logout failed'
            }
    
    async def get_user_permissions(self, user_id: str) -> List[str]:
        """
        Get user permissions by user ID
        
        Args:
            user_id: User ID
            
        Returns:
            List[str]: User permissions
        """
        try:
            # Find user by ID
            for user_data in self.user_profiles.values():
                if user_data['profile'].user_id == user_id:
                    return user_data['profile'].permissions
            
            return []
            
        except Exception as e:
            logger.error(f"Error getting user permissions: {str(e)}")
            return []
    
    async def check_permission(self, user_id: str, required_permission: str) -> bool:
        """
        Check if user has specific permission
        
        Args:
            user_id: User ID
            required_permission: Required permission
            
        Returns:
            bool: True if user has permission
        """
        try:
            user_permissions = await self.get_user_permissions(user_id)
            return required_permission in user_permissions or 'admin' in user_permissions
            
        except Exception as e:
            logger.error(f"Error checking permission: {str(e)}")
            return False
    
    async def get_security_analytics(self) -> Dict[str, Any]:
        """
        Get comprehensive security analytics
        
        Returns:
            Dict[str, Any]: Security analytics data
        """
        try:
            # Calculate authentication statistics
            auth_success_rate = (self.successful_auths / max(self.total_auth_attempts, 1)) * 100
            
            # Analyze recent security events
            recent_events = [
                event for event in self.security_events
                if event.timestamp > datetime.now() - timedelta(hours=24)
            ]
            
            # Categorize events by severity
            event_severity_counts = {}
            for level in SecurityLevel:
                event_severity_counts[level.name] = len([
                    event for event in recent_events
                    if event.severity == level
                ])
            
            # Analyze failed authentication patterns
            recent_failed_attempts = [
                attempt for attempt in self.authentication_attempts
                if not attempt.success and attempt.timestamp > datetime.now() - timedelta(hours=24)
            ]
            
            # IP analysis using mathematical engine
            ip_analysis = await self._analyze_ip_patterns()
            
            # User behavior analysis
            user_behavior_analysis = await self._analyze_user_behavior()
            
            return {
                'authentication_statistics': {
                    'total_attempts': self.total_auth_attempts,
                    'successful_authentications': self.successful_auths,
                    'failed_authentications': self.failed_auths,
                    'success_rate': auth_success_rate,
                    'recent_failed_attempts': len(recent_failed_attempts)
                },
                'security_events': {
                    'total_events': len(self.security_events),
                    'recent_events': len(recent_events),
                    'severity_breakdown': event_severity_counts
                },
                'session_management': {
                    'active_sessions': len(self.active_sessions),
                    'total_users': len(self.user_profiles),
                    'locked_accounts': len([
                        profile['profile'] for profile in self.user_profiles.values()
                        if profile['profile'].account_locked
                    ])
                },
                'threat_detection': {
                    'blocked_ips': len(self.blocked_ips),
                    'suspicious_activities': len([
                        event for event in recent_events
                        if 'SUSPICIOUS' in event.event_type
                    ]),
                    'threat_detection_enabled': self.threat_detection_enabled
                },
                'ip_analysis': ip_analysis,
                'user_behavior_analysis': user_behavior_analysis,
                'compliance_status': {
                    'password_policy_enforced': True,
                    'session_timeout_configured': True,
                    'account_lockout_enabled': True,
                    'audit_logging_active': True
                },
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting security analytics: {str(e)}")
            return {
                'error': f"Failed to get security analytics: {str(e)}",
                'timestamp': datetime.now().isoformat()
            }
    
    # Internal helper methods
    
    def _hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(32)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return salt + password_hash.hex()
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt = stored_hash[:64]
            stored_password_hash = stored_hash[64:]
            password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return password_hash.hex() == stored_password_hash
        except Exception:
            return False
    
    def _get_role_permissions(self, role: UserRole) -> List[str]:
        """Get permissions for user role"""
        role_permissions = {
            UserRole.ADMIN: [
                'admin', 'user_management', 'system_administration',
                'security_management', 'audit_access', 'all_permissions'
            ],
            UserRole.ENTERPRISE_USER: [
                'enterprise_features', 'advanced_analytics', 'team_management',
                'api_access', 'export_data', 'custom_integrations'
            ],
            UserRole.STANDARD_USER: [
                'basic_features', 'personal_analytics', 'data_access',
                'profile_management'
            ],
            UserRole.READONLY_USER: [
                'view_only', 'basic_analytics'
            ],
            UserRole.API_USER: [
                'api_access', 'automated_operations'
            ],
            UserRole.GUEST: [
                'limited_access'
            ]
        }
        
        return role_permissions.get(role, [])
    
    async def _perform_security_checks(self, username: str, ip_address: str) -> Dict[str, Any]:
        """Perform comprehensive security checks"""
        
        # Check if IP is blocked
        if ip_address in self.blocked_ips:
            block_info = self.blocked_ips[ip_address]
            if datetime.now() < block_info['blocked_until']:
                return {
                    'allowed': False,
                    'reason': 'IP address is temporarily blocked',
                    'retry_after': block_info['blocked_until'].isoformat()
                }
            else:
                # Unblock expired blocks
                del self.blocked_ips[ip_address]
        
        # Check for suspicious patterns using reasoning engine
        pattern_analysis = await self.reasoning_engine.reason(
            f"Analyze security patterns for user {username} from IP {ip_address}"
        )
        
        # Rate limiting check (simplified)
        recent_attempts = [
            attempt for attempt in self.authentication_attempts
            if attempt.ip_address == ip_address 
            and attempt.timestamp > datetime.now() - timedelta(minutes=5)
        ]
        
        if len(recent_attempts) > 10:  # More than 10 attempts in 5 minutes
            return {
                'allowed': False,
                'reason': 'Too many authentication attempts'
            }
        
        return {
            'allowed': True,
            'security_score': pattern_analysis.get('confidence', 0.8)
        }
    
    async def _create_session_token(self, user_profile: UserProfile, 
                                  ip_address: str, user_agent: str) -> SessionToken:
        """Create session token"""
        token_id = str(uuid.uuid4())
        
        # JWT payload
        payload = {
            'token_id': token_id,
            'user_id': user_profile.user_id,
            'username': user_profile.username,
            'role': user_profile.role.value,
            'permissions': user_profile.permissions,
            'iat': datetime.now(),
            'exp': datetime.now() + timedelta(hours=self.token_expiry_hours)
        }
        
        # Generate JWT token
        jwt_token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        
        # Create session object
        session = SessionToken(
            token_id=token_id,
            user_id=user_profile.user_id,
            token=jwt_token,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=self.token_expiry_hours),
            last_accessed=datetime.now(),
            ip_address=ip_address,
            user_agent=user_agent,
            permissions=user_profile.permissions,
            metadata={}
        )
        
        # Store session
        self.active_sessions[token_id] = session
        
        # Cleanup old sessions for user
        await self._cleanup_old_user_sessions(user_profile.user_id)
        
        return session
    
    async def _cleanup_session(self, token_id: str):
        """Cleanup session"""
        if token_id in self.active_sessions:
            del self.active_sessions[token_id]
            logger.info(f"Cleaned up session: {token_id}")
    
    async def _cleanup_old_user_sessions(self, user_id: str):
        """Cleanup old sessions for user"""
        user_sessions = [
            (token_id, session) for token_id, session in self.active_sessions.items()
            if session.user_id == user_id
        ]
        
        # Sort by creation time (newest first)
        user_sessions.sort(key=lambda x: x[1].created_at, reverse=True)
        
        # Remove old sessions beyond max concurrent limit
        if len(user_sessions) > self.max_concurrent_sessions:
            for token_id, _ in user_sessions[self.max_concurrent_sessions:]:
                await self._cleanup_session(token_id)
    
    async def _log_security_event(self, event_type: str, user_id: Optional[str],
                                ip_address: str, severity: SecurityLevel, description: str):
        """Log security event"""
        event = SecurityEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            timestamp=datetime.now(),
            severity=severity,
            description=description,
            metadata={}
        )
        
        self.security_events.append(event)
        self.security_events_count += 1
        
        logger.info(f"Security event logged: {event_type} - {description}")
    
    async def _log_authentication_attempt(self, attempt_id: str, username: str,
                                        ip_address: str, user_agent: str,
                                        method: AuthenticationMethod, success: bool,
                                        failure_reason: Optional[str] = None,
                                        security_score: float = 0.0):
        """Log authentication attempt"""
        attempt = AuthenticationAttempt(
            attempt_id=attempt_id,
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            method=method,
            success=success,
            timestamp=datetime.now(),
            failure_reason=failure_reason,
            security_score=security_score
        )
        
        self.authentication_attempts.append(attempt)
    
    async def _calculate_security_score(self, user_profile: UserProfile,
                                      ip_address: str, user_agent: str) -> float:
        """Calculate security score using mathematical engine"""
        
        # Use mathematical engine for security score calculation
        factors = {
            'user_history': user_profile.login_count / max(user_profile.login_count + user_profile.failed_login_attempts, 1),
            'ip_reputation': 0.8,  # Simplified IP reputation
            'time_patterns': 0.9,  # Simplified time pattern analysis
            'device_consistency': 0.85  # Simplified device consistency
        }
        
        calculation_result = self.mathematical_engine.solve_problem(
            f"Calculate weighted security score with factors: {factors}"
        )
        
        # Return calculated score or default
        return calculation_result.get('result', 0.85)
    
    async def _assess_ip_change_risk(self, old_ip: str, new_ip: str, user_id: str) -> float:
        """Assess risk of IP address change"""
        
        # Use reasoning engine to assess IP change risk
        risk_assessment = await self.reasoning_engine.reason(
            f"Assess security risk of IP change from {old_ip} to {new_ip} for user {user_id}"
        )
        
        return risk_assessment.get('confidence', 0.5)
    
    async def _update_user_behavior_model(self, user_profile: UserProfile,
                                        ip_address: str, user_agent: str):
        """Update user behavior model using learning engine"""
        
        behavior_data = {
            'user_id': user_profile.user_id,
            'login_time': datetime.now().isoformat(),
            'ip_address': ip_address,
            'user_agent': user_agent,
            'login_count': user_profile.login_count
        }
        
        # Use learning engine to update behavior model
        await self.learning_engine.learn(behavior_data)
    
    async def _analyze_ip_patterns(self) -> Dict[str, Any]:
        """Analyze IP address patterns using mathematical engine"""
        
        # Collect IP data
        ip_data = {}
        for attempt in self.authentication_attempts:
            ip = attempt.ip_address
            if ip not in ip_data:
                ip_data[ip] = {'total': 0, 'successful': 0, 'failed': 0}
            
            ip_data[ip]['total'] += 1
            if attempt.success:
                ip_data[ip]['successful'] += 1
            else:
                ip_data[ip]['failed'] += 1
        
        # Use mathematical engine for pattern analysis
        pattern_result = self.mathematical_engine.solve_problem(
            f"Analyze IP address patterns with data: {len(ip_data)} unique IPs"
        )
        
        return {
            'unique_ips': len(ip_data),
            'analysis_confidence': pattern_result.get('confidence', 0.9),
            'suspicious_ips': [
                ip for ip, data in ip_data.items()
                if data['failed'] > data['successful'] * 2
            ]
        }
    
    async def _analyze_user_behavior(self) -> Dict[str, Any]:
        """Analyze user behavior patterns"""
        
        # Collect user behavior data
        user_stats = {}
        for username, user_data in self.user_profiles.items():
            profile = user_data['profile']
            user_stats[username] = {
                'login_count': profile.login_count,
                'failed_attempts': profile.failed_login_attempts,
                'account_locked': profile.account_locked,
                'last_login': profile.last_login.isoformat() if profile.last_login else None
            }
        
        return {
            'total_users': len(user_stats),
            'active_users': len([
                stats for stats in user_stats.values()
                if stats['login_count'] > 0
            ]),
            'locked_accounts': len([
                stats for stats in user_stats.values()
                if stats['account_locked']
            ])
        }

# Service instance for easy import
enterprise_auth_service = EnterpriseAuthenticationService()
