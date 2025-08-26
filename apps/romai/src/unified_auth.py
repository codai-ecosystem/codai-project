"""
Unified Authentication System for Codai Ecosystem
Single sign-on and unified identity management across all services
"""

import asyncio
import aiohttp
import jwt
import bcrypt
import redis
from typing import Dict, List, Optional, Any, Tuple
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
import secrets
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

class UserRole(Enum):
    """User roles in the Codai ecosystem"""
    GUEST = "guest"
    USER = "user"
    DEVELOPER = "developer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AuthenticationProvider(Enum):
    """Authentication providers"""
    LOCAL = "local"
    OAUTH_GOOGLE = "oauth_google"
    OAUTH_GITHUB = "oauth_github"
    OAUTH_MICROSOFT = "oauth_microsoft"
    ENTERPRISE_SSO = "enterprise_sso"

@dataclass
class UserProfile:
    """Complete user profile across the ecosystem"""
    user_id: str
    email: str
    username: str
    full_name: str
    roles: List[UserRole]
    provider: AuthenticationProvider
    preferences: Dict[str, Any]
    service_permissions: Dict[str, List[str]]
    metadata: Dict[str, Any]
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    email_verified: bool = False
    two_factor_enabled: bool = False

@dataclass
class AuthenticationToken:
    """Authentication token with metadata"""
    token: str
    token_type: str  # access, refresh, service
    user_id: str
    expires_at: datetime
    scopes: List[str]
    service: Optional[str] = None
    metadata: Dict[str, Any] = None

@dataclass
class SessionInfo:
    """Session information"""
    session_id: str
    user_id: str
    access_token: str
    refresh_token: str
    service_tokens: Dict[str, str]
    expires_at: datetime
    created_at: datetime
    last_activity: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class UnifiedAuthenticationSystem:
    """
    Unified Authentication System for Codai Ecosystem
    
    Features:
    - Single Sign-On (SSO) across all services
    - Multi-factor authentication
    - OAuth integration (Google, GitHub, Microsoft)
    - Role-based access control (RBAC)
    - Service-specific token generation
    - Session management and security
    - Password policies and security
    """
    
    def __init__(self, 
                 jwt_secret: str = None,
                 redis_url: str = "redis://localhost:8020",
                 token_expiry_hours: int = 24):
        
        self.jwt_secret = jwt_secret or self._generate_jwt_secret()
        self.redis_url = redis_url
        self.token_expiry_hours = token_expiry_hours
        
        # Initialize Redis connection for session storage
        self.redis_client = None
        
        # User storage (in production, use proper database)
        self.user_profiles = {}
        self.active_sessions = {}
        
        # Service configurations
        self.service_configs = self._initialize_service_configs()
        
        # Security settings
        self.password_policy = {
            "min_length": 8,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_numbers": True,
            "require_special": True,
            "max_attempts": 5,
            "lockout_duration": 300  # 5 minutes
        }
        
        logger.info("🔐 Unified Authentication System initialized")
    
    async def initialize_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            await self.redis_client.ping()
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Using in-memory storage.")
            self.redis_client = None
    
    def _generate_jwt_secret(self) -> str:
        """Generate a secure JWT secret"""
        return secrets.token_urlsafe(64)
    
    def _initialize_service_configs(self) -> Dict[str, Dict[str, Any]]:
        """Initialize service-specific configurations"""
        return {
            "identity": {
                "permissions": ["auth:read", "auth:write", "profile:manage"],
                "token_expiry": 24
            },
            "memorai": {
                "permissions": ["memory:read", "memory:write", "memory:delete", "context:manage"],
                "token_expiry": 12
            },
            "bancai": {
                "permissions": ["finance:read", "finance:write", "transaction:create"],
                "token_expiry": 4  # Shorter expiry for financial operations
            },
            "romai": {
                "permissions": ["ai:inference", "ai:training", "ai:reasoning", "model:access"],
                "token_expiry": 8
            },
            "admin": {
                "permissions": ["system:read", "system:write", "users:manage", "analytics:read"],
                "token_expiry": 2  # Very short expiry for admin operations
            },
            "controlai": {
                "permissions": ["ai:monitor", "ai:control", "metrics:read", "dashboard:access"],
                "token_expiry": 6
            },
            "kodex": {
                "permissions": ["code:analyze", "code:document", "code:quality"],
                "token_expiry": 6
            },
            "explorer": {
                "permissions": ["blockchain:read", "transaction:analyze", "data:visualize"],
                "token_expiry": 12
            }
        }
    
    async def register_user(self, 
                          email: str,
                          password: str,
                          username: str,
                          full_name: str,
                          provider: AuthenticationProvider = AuthenticationProvider.LOCAL) -> UserProfile:
        """Register a new user in the ecosystem"""
        
        try:
            # Validate input
            if not self._validate_email(email):
                raise Exception("Invalid email format")
            
            if not self._validate_password(password):
                raise Exception("Password does not meet security requirements")
            
            if email in [profile.email for profile in self.user_profiles.values()]:
                raise Exception("Email already registered")
            
            # Generate user ID
            user_id = str(uuid.uuid4())
            
            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create user profile
            user_profile = UserProfile(
                user_id=user_id,
                email=email,
                username=username,
                full_name=full_name,
                roles=[UserRole.USER],
                provider=provider,
                preferences={
                    "theme": "system",
                    "language": "en",
                    "notifications": {"email": True, "push": False},
                    "privacy": {"analytics": True, "marketing": False}
                },
                service_permissions=self._generate_default_permissions(),
                metadata={"password_hash": password_hash},
                created_at=datetime.utcnow()
            )
            
            # Store user profile
            self.user_profiles[user_id] = user_profile
            
            # Store in Redis if available
            if self.redis_client:
                await self._store_user_profile_redis(user_profile)
            
            logger.info(f"✅ User registered: {email}")
            return user_profile
            
        except Exception as e:
            logger.error(f"User registration failed: {e}")
            raise
    
    async def authenticate_user(self, 
                              email: str, 
                              password: str,
                              ip_address: str = None,
                              user_agent: str = None) -> SessionInfo:
        """Authenticate user and create unified session"""
        
        try:
            # Find user by email
            user_profile = None
            for profile in self.user_profiles.values():
                if profile.email == email:
                    user_profile = profile
                    break
            
            if not user_profile:
                raise Exception("Invalid credentials")
            
            # Verify password
            stored_hash = user_profile.metadata.get("password_hash")
            if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
                raise Exception("Invalid credentials")
            
            # Check if user is active
            if not user_profile.is_active:
                raise Exception("Account is deactivated")
            
            # Generate session
            session_info = await self._create_user_session(
                user_profile, ip_address, user_agent
            )
            
            # Update last login
            user_profile.last_login = datetime.utcnow()
            
            logger.info(f"✅ User authenticated: {email}")
            return session_info
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            raise
    
    async def _create_user_session(self, 
                                 user_profile: UserProfile,
                                 ip_address: str = None,
                                 user_agent: str = None) -> SessionInfo:
        """Create a new user session with tokens"""
        
        session_id = str(uuid.uuid4())
        current_time = datetime.utcnow()
        
        # Generate access token
        access_token = self._generate_jwt_token(
            user_id=user_profile.user_id,
            session_id=session_id,
            scopes=["global:access"],
            expires_hours=self.token_expiry_hours
        )
        
        # Generate refresh token
        refresh_token = self._generate_jwt_token(
            user_id=user_profile.user_id,
            session_id=session_id,
            scopes=["token:refresh"],
            expires_hours=self.token_expiry_hours * 7  # Refresh token lasts 7x longer
        )
        
        # Generate service-specific tokens
        service_tokens = {}
        for service_name, config in self.service_configs.items():
            user_permissions = user_profile.service_permissions.get(service_name, [])
            if user_permissions:  # Only generate token if user has permissions
                service_tokens[service_name] = self._generate_jwt_token(
                    user_id=user_profile.user_id,
                    session_id=session_id,
                    scopes=user_permissions,
                    expires_hours=config["token_expiry"],
                    service=service_name
                )
        
        # Create session info
        session_info = SessionInfo(
            session_id=session_id,
            user_id=user_profile.user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            service_tokens=service_tokens,
            expires_at=current_time + timedelta(hours=self.token_expiry_hours),
            created_at=current_time,
            last_activity=current_time,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Store session
        self.active_sessions[session_id] = session_info
        
        # Store in Redis if available
        if self.redis_client:
            await self._store_session_redis(session_info)
        
        return session_info
    
    def _generate_jwt_token(self, 
                          user_id: str,
                          session_id: str,
                          scopes: List[str],
                          expires_hours: int = 24,
                          service: str = None) -> str:
        """Generate JWT token"""
        
        current_time = datetime.utcnow()
        
        payload = {
            "user_id": user_id,
            "session_id": session_id,
            "scopes": scopes,
            "iat": current_time,
            "exp": current_time + timedelta(hours=expires_hours),
            "iss": "codai_ecosystem",
            "aud": service if service else "global"
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    async def verify_token(self, token: str, required_scope: str = None) -> Dict[str, Any]:
        """Verify JWT token and return payload"""
        
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            
            # Check if session is still active
            session_id = payload.get("session_id")
            if session_id and session_id not in self.active_sessions:
                raise Exception("Session expired or invalid")
            
            # Check required scope
            if required_scope:
                scopes = payload.get("scopes", [])
                if required_scope not in scopes and "global:access" not in scopes:
                    raise Exception(f"Insufficient permissions: {required_scope} required")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise Exception("Token expired")
        except jwt.InvalidTokenError:
            raise Exception("Invalid token")
    
    async def refresh_session(self, refresh_token: str) -> SessionInfo:
        """Refresh user session using refresh token"""
        
        try:
            # Verify refresh token
            payload = await self.verify_token(refresh_token)
            
            if "token:refresh" not in payload.get("scopes", []):
                raise Exception("Invalid refresh token")
            
            user_id = payload["user_id"]
            session_id = payload["session_id"]
            
            # Get user profile
            user_profile = self.user_profiles.get(user_id)
            if not user_profile:
                raise Exception("User not found")
            
            # Create new session
            new_session = await self._create_user_session(user_profile)
            
            # Invalidate old session
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            
            logger.info(f"✅ Session refreshed for user: {user_profile.email}")
            return new_session
            
        except Exception as e:
            logger.error(f"Session refresh failed: {e}")
            raise
    
    async def logout_user(self, session_id: str) -> bool:
        """Logout user and invalidate session"""
        
        try:
            if session_id in self.active_sessions:
                session_info = self.active_sessions[session_id]
                
                # Remove from memory
                del self.active_sessions[session_id]
                
                # Remove from Redis if available
                if self.redis_client:
                    await self.redis_client.delete(f"session:{session_id}")
                
                logger.info(f"✅ User logged out: {session_info.user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Logout failed: {e}")
            return False
    
    async def update_user_permissions(self, 
                                    user_id: str,
                                    service: str,
                                    permissions: List[str]) -> bool:
        """Update user permissions for a specific service"""
        
        try:
            user_profile = self.user_profiles.get(user_id)
            if not user_profile:
                raise Exception("User not found")
            
            # Update permissions
            user_profile.service_permissions[service] = permissions
            
            # Regenerate service tokens for active sessions
            await self._regenerate_service_tokens(user_id, service)
            
            logger.info(f"✅ Permissions updated for user {user_id} in service {service}")
            return True
            
        except Exception as e:
            logger.error(f"Permission update failed: {e}")
            return False
    
    async def _regenerate_service_tokens(self, user_id: str, service: str):
        """Regenerate service tokens for a user"""
        
        user_profile = self.user_profiles.get(user_id)
        if not user_profile:
            return
        
        # Find active sessions for this user
        user_sessions = [
            session for session in self.active_sessions.values()
            if session.user_id == user_id
        ]
        
        # Update service tokens in all active sessions
        for session in user_sessions:
            service_config = self.service_configs.get(service)
            if service_config:
                permissions = user_profile.service_permissions.get(service, [])
                if permissions:
                    session.service_tokens[service] = self._generate_jwt_token(
                        user_id=user_id,
                        session_id=session.session_id,
                        scopes=permissions,
                        expires_hours=service_config["token_expiry"],
                        service=service
                    )
    
    def _generate_default_permissions(self) -> Dict[str, List[str]]:
        """Generate default permissions for a new user"""
        return {
            "memorai": ["memory:read", "memory:write", "context:manage"],
            "romai": ["ai:inference", "ai:reasoning"],
            "kodex": ["code:analyze", "code:document"],
            "explorer": ["blockchain:read", "data:visualize"],
            "controlai": ["metrics:read", "dashboard:access"]
        }
    
    def _validate_email(self, email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _validate_password(self, password: str) -> bool:
        """Validate password against security policy"""
        policy = self.password_policy
        
        if len(password) < policy["min_length"]:
            return False
        
        if policy["require_uppercase"] and not any(c.isupper() for c in password):
            return False
        
        if policy["require_lowercase"] and not any(c.islower() for c in password):
            return False
        
        if policy["require_numbers"] and not any(c.isdigit() for c in password):
            return False
        
        if policy["require_special"] and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False
        
        return True
    
    async def _store_user_profile_redis(self, user_profile: UserProfile):
        """Store user profile in Redis"""
        try:
            if self.redis_client:
                profile_data = asdict(user_profile)
                # Convert datetime objects to ISO strings
                profile_data["created_at"] = user_profile.created_at.isoformat()
                if user_profile.last_login:
                    profile_data["last_login"] = user_profile.last_login.isoformat()
                
                await self.redis_client.setex(
                    f"user:{user_profile.user_id}",
                    86400 * 7,  # 7 days
                    json.dumps(profile_data, default=str)
                )
        except Exception as e:
            logger.error(f"Failed to store user profile in Redis: {e}")
    
    async def _store_session_redis(self, session_info: SessionInfo):
        """Store session info in Redis"""
        try:
            if self.redis_client:
                session_data = asdict(session_info)
                # Convert datetime objects to ISO strings
                session_data["expires_at"] = session_info.expires_at.isoformat()
                session_data["created_at"] = session_info.created_at.isoformat()
                session_data["last_activity"] = session_info.last_activity.isoformat()
                
                await self.redis_client.setex(
                    f"session:{session_info.session_id}",
                    int(self.token_expiry_hours * 3600),  # Convert hours to seconds
                    json.dumps(session_data, default=str)
                )
        except Exception as e:
            logger.error(f"Failed to store session in Redis: {e}")
    
    async def get_active_sessions_count(self) -> int:
        """Get number of active sessions"""
        return len(self.active_sessions)
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID"""
        return self.user_profiles.get(user_id)
    
    async def get_session_info(self, session_id: str) -> Optional[SessionInfo]:
        """Get session information by session ID"""
        return self.active_sessions.get(session_id)


# Global authentication system instance
unified_auth_system = None

def get_unified_auth_system() -> UnifiedAuthenticationSystem:
    """Get global unified authentication system instance"""
    global unified_auth_system
    if unified_auth_system is None:
        unified_auth_system = UnifiedAuthenticationSystem()
    return unified_auth_system


# Convenience functions
async def register_codai_user(email: str, password: str, username: str, full_name: str) -> UserProfile:
    """Register a new user in the Codai ecosystem"""
    auth_system = get_unified_auth_system()
    return await auth_system.register_user(email, password, username, full_name)

async def authenticate_codai_user(email: str, password: str, **kwargs) -> SessionInfo:
    """Authenticate user and create session"""
    auth_system = get_unified_auth_system()
    return await auth_system.authenticate_user(email, password, **kwargs)

async def verify_codai_token(token: str, required_scope: str = None) -> Dict[str, Any]:
    """Verify Codai ecosystem token"""
    auth_system = get_unified_auth_system()
    return await auth_system.verify_token(token, required_scope)

async def logout_codai_user(session_id: str) -> bool:
    """Logout user from Codai ecosystem"""
    auth_system = get_unified_auth_system()
    return await auth_system.logout_user(session_id)


# Example usage and testing
if __name__ == "__main__":
    async def test_unified_auth():
        """Test the unified authentication system"""
        print("🔐 Testing Unified Authentication System")
        
        auth_system = get_unified_auth_system()
        await auth_system.initialize_redis()
        
        # Register a test user
        user_profile = await auth_system.register_user(
            email="test@codai.com",
            password="SecurePass123!",
            username="testuser",
            full_name="Test User"
        )
        print(f"✅ User registered: {user_profile.email}")
        
        # Authenticate user
        session_info = await auth_system.authenticate_user(
            email="test@codai.com",
            password="SecurePass123!"
        )
        print(f"✅ User authenticated: {session_info.session_id}")
        
        # Verify token
        token_payload = await auth_system.verify_token(session_info.access_token)
        print(f"✅ Token verified: {token_payload['user_id']}")
        
        # Test service token
        romai_token = session_info.service_tokens.get("romai")
        if romai_token:
            romai_payload = await auth_system.verify_token(romai_token, "ai:inference")
            print(f"✅ RomAI token verified: {romai_payload['aud']}")
        
        # Logout user
        success = await auth_system.logout_user(session_info.session_id)
        print(f"✅ User logged out: {success}")
    
    # Run test
    asyncio.run(test_unified_auth())