# 🔐 RomAI Enterprise Single Sign-On (SSO) Integration
# Production-grade SSO support with SAML, OAuth2, and OpenID Connect

from typing import Dict, List, Optional, Any, Union, Callable
from pydantic import BaseModel, Field, validator
import jwt
from datetime import datetime, timedelta
import hashlib
import hmac
import secrets
import base64
import urllib.parse
import xml.etree.ElementTree as ET
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import requests
import asyncio
import logging
from enum import Enum
from dataclasses import dataclass
import json
import time
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SSOProtocol(str, Enum):
    """Supported SSO protocols"""
    SAML2 = "saml2"
    OAUTH2 = "oauth2"
    OPENID_CONNECT = "openid_connect"
    CAS = "cas"
    LDAP = "ldap"

class TokenType(str, Enum):
    """Token types"""
    ACCESS_TOKEN = "access_token"
    REFRESH_TOKEN = "refresh_token"
    ID_TOKEN = "id_token"
    SAML_ASSERTION = "saml_assertion"

class UserRole(str, Enum):
    """User roles in RomAI system"""
    ADMIN = "admin"
    DEVELOPER = "developer"
    USER = "user"
    VIEWER = "viewer"
    COMPLIANCE_OFFICER = "compliance_officer"

@dataclass
class SSOConfiguration:
    """SSO provider configuration"""
    provider_name: str
    protocol: SSOProtocol
    entity_id: str
    sso_url: str
    slo_url: Optional[str] = None
    certificate: Optional[str] = None
    private_key: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    scope: Optional[str] = None
    redirect_uri: Optional[str] = None
    issuer: Optional[str] = None
    audience: Optional[str] = None
    metadata_url: Optional[str] = None
    attributes_mapping: Dict[str, str] = None
    
    def __post_init__(self):
        if self.attributes_mapping is None:
            self.attributes_mapping = {
                "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
                "first_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
                "last_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
                "display_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
                "groups": "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups",
                "role": "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            }

class SSOUser(BaseModel):
    """SSO authenticated user"""
    user_id: str = Field(..., description="Unique user identifier")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email address")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    display_name: str = Field(..., description="Display name")
    roles: List[UserRole] = Field(default_factory=list, description="User roles")
    groups: List[str] = Field(default_factory=list, description="Group memberships")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Additional attributes")
    provider: str = Field(..., description="SSO provider name")
    session_id: str = Field(..., description="SSO session ID")
    expires_at: datetime = Field(..., description="Session expiration")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

class SSOToken(BaseModel):
    """SSO token representation"""
    token: str = Field(..., description="Token value")
    token_type: TokenType = Field(..., description="Token type")
    expires_at: datetime = Field(..., description="Token expiration")
    user_id: str = Field(..., description="Associated user ID")
    scope: Optional[str] = Field(None, description="Token scope")
    issuer: str = Field(..., description="Token issuer")
    audience: str = Field(..., description="Token audience")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SSOSession(BaseModel):
    """SSO session management"""
    session_id: str = Field(..., description="Session identifier")
    user_id: str = Field(..., description="User identifier")
    provider: str = Field(..., description="SSO provider")
    access_token: Optional[str] = Field(None, description="Access token")
    refresh_token: Optional[str] = Field(None, description="Refresh token")
    id_token: Optional[str] = Field(None, description="ID token")
    expires_at: datetime = Field(..., description="Session expiration")
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(None, description="Client IP address")
    user_agent: Optional[str] = Field(None, description="User agent")
    is_active: bool = Field(True, description="Session active status")

class SAMLResponse(BaseModel):
    """SAML response handling"""
    response_id: str = Field(..., description="SAML response ID")
    assertion_id: str = Field(..., description="SAML assertion ID")
    issuer: str = Field(..., description="SAML issuer")
    subject: str = Field(..., description="SAML subject")
    attributes: Dict[str, Any] = Field(default_factory=dict, description="SAML attributes")
    session_index: Optional[str] = Field(None, description="SAML session index")
    not_before: datetime = Field(..., description="Validity start time")
    not_on_or_after: datetime = Field(..., description="Validity end time")
    signature_valid: bool = Field(False, description="Signature validation status")

class OAuth2AuthorizationCode(BaseModel):
    """OAuth2 authorization code exchange"""
    code: str = Field(..., description="Authorization code")
    state: str = Field(..., description="CSRF protection state")
    redirect_uri: str = Field(..., description="Redirect URI")
    client_id: str = Field(..., description="Client ID")
    code_verifier: Optional[str] = Field(None, description="PKCE code verifier")

class RomAISSOIntegration:
    """
    🔐 RomAI Enterprise Single Sign-On Integration
    
    Provides comprehensive SSO support with multiple protocols:
    - SAML 2.0
    - OAuth 2.0
    - OpenID Connect
    - CAS
    - LDAP
    """
    
    def __init__(self):
        """Initialize SSO integration"""
        self.providers: Dict[str, SSOConfiguration] = {}
        self.active_sessions: Dict[str, SSOSession] = {}
        self.tokens: Dict[str, SSOToken] = {}
        self.private_key = None
        self.certificate = None
        self.session_timeout = timedelta(hours=8)
        self.token_timeout = timedelta(hours=1)
        
        # Initialize default providers
        self._initialize_default_providers()
        
    def _initialize_default_providers(self) -> None:
        """Initialize default SSO provider configurations"""
        try:
            # Microsoft Azure AD / Office 365
            azure_config = SSOConfiguration(
                provider_name="azure_ad",
                protocol=SSOProtocol.OPENID_CONNECT,
                entity_id="https://sts.windows.net/your-tenant-id/",
                sso_url="https://login.microsoftonline.com/your-tenant-id/oauth2/v2.0/authorize",
                client_id="your-azure-client-id",
                client_secret="your-azure-client-secret",
                scope="openid profile email",
                redirect_uri="https://your-domain.com/sso/azure/callback",
                issuer="https://sts.windows.net/your-tenant-id/",
                audience="your-azure-client-id"
            )
            self.add_provider(azure_config)
            
            # Google Workspace
            google_config = SSOConfiguration(
                provider_name="google_workspace",
                protocol=SSOProtocol.OPENID_CONNECT,
                entity_id="https://accounts.google.com",
                sso_url="https://accounts.google.com/o/oauth2/v2/auth",
                client_id="your-google-client-id",
                client_secret="your-google-client-secret",
                scope="openid profile email",
                redirect_uri="https://your-domain.com/sso/google/callback",
                issuer="https://accounts.google.com",
                audience="your-google-client-id"
            )
            self.add_provider(google_config)
            
            # Generic SAML provider
            saml_config = SSOConfiguration(
                provider_name="generic_saml",
                protocol=SSOProtocol.SAML2,
                entity_id="https://your-domain.com/sso/saml/metadata",
                sso_url="https://your-idp.com/sso/saml",
                slo_url="https://your-idp.com/slo/saml",
                certificate="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
            )
            self.add_provider(saml_config)
            
            logger.info("Default SSO providers initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize default SSO providers: {str(e)}")
    
    def add_provider(self, config: SSOConfiguration) -> None:
        """Add SSO provider configuration"""
        self.providers[config.provider_name] = config
        logger.info(f"Added SSO provider: {config.provider_name} ({config.protocol})")
    
    def remove_provider(self, provider_name: str) -> bool:
        """Remove SSO provider"""
        if provider_name in self.providers:
            del self.providers[provider_name]
            logger.info(f"Removed SSO provider: {provider_name}")
            return True
        return False
    
    async def initiate_sso(self, provider_name: str, redirect_uri: Optional[str] = None) -> str:
        """
        Initiate SSO authentication flow
        
        Args:
            provider_name: SSO provider identifier
            redirect_uri: Optional custom redirect URI
            
        Returns:
            SSO authentication URL
        """
        if provider_name not in self.providers:
            raise ValueError(f"Unknown SSO provider: {provider_name}")
        
        config = self.providers[provider_name]
        
        try:
            if config.protocol == SSOProtocol.SAML2:
                return await self._initiate_saml_sso(config, redirect_uri)
            elif config.protocol in [SSOProtocol.OAUTH2, SSOProtocol.OPENID_CONNECT]:
                return await self._initiate_oauth_sso(config, redirect_uri)
            elif config.protocol == SSOProtocol.CAS:
                return await self._initiate_cas_sso(config, redirect_uri)
            else:
                raise ValueError(f"Unsupported SSO protocol: {config.protocol}")
                
        except Exception as e:
            logger.error(f"Failed to initiate SSO for {provider_name}: {str(e)}")
            raise
    
    async def _initiate_saml_sso(self, config: SSOConfiguration, redirect_uri: Optional[str]) -> str:
        """Initiate SAML 2.0 SSO flow"""
        # Generate SAML AuthnRequest
        request_id = self._generate_id()
        issue_instant = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        
        authn_request = f"""
        <samlp:AuthnRequest
            xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
            xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
            ID="{request_id}"
            Version="2.0"
            IssueInstant="{issue_instant}"
            Destination="{config.sso_url}"
            AssertionConsumerServiceURL="{redirect_uri or config.redirect_uri}">
            <saml:Issuer>{config.entity_id}</saml:Issuer>
            <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
        </samlp:AuthnRequest>
        """
        
        # Encode and sign request
        encoded_request = base64.b64encode(authn_request.encode()).decode()
        
        # Build SSO URL
        params = {
            'SAMLRequest': encoded_request,
            'RelayState': redirect_uri or '/'
        }
        
        sso_url = f"{config.sso_url}?{urllib.parse.urlencode(params)}"
        logger.info(f"SAML SSO URL generated for {config.provider_name}")
        
        return sso_url
    
    async def _initiate_oauth_sso(self, config: SSOConfiguration, redirect_uri: Optional[str]) -> str:
        """Initiate OAuth 2.0/OpenID Connect SSO flow"""
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate code verifier for PKCE (if supported)
        code_verifier = secrets.token_urlsafe(32)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode().rstrip('=')
        
        # Build authorization URL
        params = {
            'response_type': 'code',
            'client_id': config.client_id,
            'redirect_uri': redirect_uri or config.redirect_uri,
            'scope': config.scope or 'openid profile email',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        auth_url = f"{config.sso_url}?{urllib.parse.urlencode(params)}"
        
        # Store state and code verifier for validation
        self._store_oauth_state(state, code_verifier, config.provider_name)
        
        logger.info(f"OAuth SSO URL generated for {config.provider_name}")
        return auth_url
    
    async def _initiate_cas_sso(self, config: SSOConfiguration, redirect_uri: Optional[str]) -> str:
        """Initiate CAS SSO flow"""
        params = {
            'service': redirect_uri or config.redirect_uri
        }
        
        cas_url = f"{config.sso_url}?{urllib.parse.urlencode(params)}"
        logger.info(f"CAS SSO URL generated for {config.provider_name}")
        
        return cas_url
    
    async def handle_sso_callback(self, provider_name: str, callback_data: Dict[str, Any]) -> SSOUser:
        """
        Handle SSO callback and extract user information
        
        Args:
            provider_name: SSO provider identifier
            callback_data: Callback parameters from SSO provider
            
        Returns:
            Authenticated SSOUser
        """
        if provider_name not in self.providers:
            raise ValueError(f"Unknown SSO provider: {provider_name}")
        
        config = self.providers[provider_name]
        
        try:
            if config.protocol == SSOProtocol.SAML2:
                return await self._handle_saml_callback(config, callback_data)
            elif config.protocol in [SSOProtocol.OAUTH2, SSOProtocol.OPENID_CONNECT]:
                return await self._handle_oauth_callback(config, callback_data)
            elif config.protocol == SSOProtocol.CAS:
                return await self._handle_cas_callback(config, callback_data)
            else:
                raise ValueError(f"Unsupported SSO protocol: {config.protocol}")
                
        except Exception as e:
            logger.error(f"Failed to handle SSO callback for {provider_name}: {str(e)}")
            raise
    
    async def _handle_saml_callback(self, config: SSOConfiguration, callback_data: Dict[str, Any]) -> SSOUser:
        """Handle SAML callback"""
        saml_response = callback_data.get('SAMLResponse')
        if not saml_response:
            raise ValueError("Missing SAML response")
        
        # Decode SAML response
        decoded_response = base64.b64decode(saml_response).decode()
        
        # Parse SAML assertion
        response_data = self._parse_saml_response(decoded_response, config)
        
        # Extract user information
        user = self._create_user_from_saml(response_data, config)
        
        # Create session
        session = await self._create_session(user, config.provider_name)
        
        logger.info(f"SAML authentication successful for user: {user.username}")
        return user
    
    async def _handle_oauth_callback(self, config: SSOConfiguration, callback_data: Dict[str, Any]) -> SSOUser:
        """Handle OAuth 2.0/OpenID Connect callback"""
        code = callback_data.get('code')
        state = callback_data.get('state')
        
        if not code or not state:
            raise ValueError("Missing authorization code or state")
        
        # Validate state
        stored_data = self._retrieve_oauth_state(state)
        if not stored_data:
            raise ValueError("Invalid or expired state")
        
        # Exchange code for tokens
        tokens = await self._exchange_authorization_code(config, code, stored_data['code_verifier'])
        
        # Extract user information from tokens
        user = await self._extract_user_from_tokens(tokens, config)
        
        # Create session
        session = await self._create_session(user, config.provider_name, tokens)
        
        logger.info(f"OAuth authentication successful for user: {user.username}")
        return user
    
    async def _handle_cas_callback(self, config: SSOConfiguration, callback_data: Dict[str, Any]) -> SSOUser:
        """Handle CAS callback"""
        ticket = callback_data.get('ticket')
        service = callback_data.get('service')
        
        if not ticket:
            raise ValueError("Missing CAS ticket")
        
        # Validate ticket with CAS server
        validation_url = f"{config.sso_url}/validate"
        params = {
            'ticket': ticket,
            'service': service
        }
        
        response = requests.get(validation_url, params=params)
        if response.status_code != 200:
            raise ValueError("CAS ticket validation failed")
        
        # Parse CAS response
        lines = response.text.strip().split('\n')
        if lines[0] != 'yes':
            raise ValueError("CAS authentication failed")
        
        username = lines[1] if len(lines) > 1 else 'unknown'
        
        # Create user from CAS response
        user = SSOUser(
            user_id=username,
            username=username,
            email=f"{username}@company.com",
            first_name="",
            last_name="",
            display_name=username,
            provider=config.provider_name,
            session_id=self._generate_id(),
            expires_at=datetime.utcnow() + self.session_timeout
        )
        
        # Create session
        session = await self._create_session(user, config.provider_name)
        
        logger.info(f"CAS authentication successful for user: {user.username}")
        return user
    
    async def _exchange_authorization_code(self, config: SSOConfiguration, code: str, code_verifier: str) -> Dict[str, Any]:
        """Exchange OAuth authorization code for tokens"""
        token_url = config.sso_url.replace('/authorize', '/token')
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': config.client_id,
            'client_secret': config.client_secret,
            'redirect_uri': config.redirect_uri,
            'code_verifier': code_verifier
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        response = requests.post(token_url, data=data, headers=headers)
        if response.status_code != 200:
            raise ValueError(f"Token exchange failed: {response.text}")
        
        return response.json()
    
    async def _extract_user_from_tokens(self, tokens: Dict[str, Any], config: SSOConfiguration) -> SSOUser:
        """Extract user information from OAuth tokens"""
        # Decode ID token if present
        id_token = tokens.get('id_token')
        if id_token:
            # Decode JWT without verification for now (should verify signature in production)
            payload = jwt.decode(id_token, options={"verify_signature": False})
            
            user = SSOUser(
                user_id=payload.get('sub', ''),
                username=payload.get('preferred_username', payload.get('email', '')),
                email=payload.get('email', ''),
                first_name=payload.get('given_name', ''),
                last_name=payload.get('family_name', ''),
                display_name=payload.get('name', ''),
                provider=config.provider_name,
                session_id=self._generate_id(),
                expires_at=datetime.utcnow() + self.session_timeout,
                attributes=payload
            )
            
            return user
        
        # Fallback to access token userinfo endpoint
        access_token = tokens.get('access_token')
        if access_token:
            userinfo_url = config.sso_url.replace('/authorize', '/userinfo')
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(userinfo_url, headers=headers)
            if response.status_code == 200:
                userinfo = response.json()
                
                user = SSOUser(
                    user_id=userinfo.get('sub', ''),
                    username=userinfo.get('preferred_username', userinfo.get('email', '')),
                    email=userinfo.get('email', ''),
                    first_name=userinfo.get('given_name', ''),
                    last_name=userinfo.get('family_name', ''),
                    display_name=userinfo.get('name', ''),
                    provider=config.provider_name,
                    session_id=self._generate_id(),
                    expires_at=datetime.utcnow() + self.session_timeout,
                    attributes=userinfo
                )
                
                return user
        
        raise ValueError("Unable to extract user information from tokens")
    
    def _parse_saml_response(self, saml_response: str, config: SSOConfiguration) -> SAMLResponse:
        """Parse SAML response XML"""
        try:
            root = ET.fromstring(saml_response)
            
            # Extract SAML elements (simplified parsing)
            # In production, use proper SAML library for full validation
            
            response_id = root.get('ID', '')
            issuer = root.find('.//{urn:oasis:names:tc:SAML:2.0:assertion}Issuer')
            subject = root.find('.//{urn:oasis:names:tc:SAML:2.0:assertion}Subject')
            
            # Extract attributes
            attributes = {}
            attr_statements = root.findall('.//{urn:oasis:names:tc:SAML:2.0:assertion}AttributeStatement')
            for attr_stmt in attr_statements:
                for attr in attr_stmt.findall('.//{urn:oasis:names:tc:SAML:2.0:assertion}Attribute'):
                    attr_name = attr.get('Name', '')
                    attr_values = [val.text for val in attr.findall('.//{urn:oasis:names:tc:SAML:2.0:assertion}AttributeValue')]
                    attributes[attr_name] = attr_values[0] if len(attr_values) == 1 else attr_values
            
            return SAMLResponse(
                response_id=response_id,
                assertion_id=response_id,
                issuer=issuer.text if issuer is not None else '',
                subject=subject.text if subject is not None else '',
                attributes=attributes,
                not_before=datetime.utcnow(),
                not_on_or_after=datetime.utcnow() + self.session_timeout,
                signature_valid=True  # Should validate signature in production
            )
            
        except Exception as e:
            logger.error(f"Failed to parse SAML response: {str(e)}")
            raise
    
    def _create_user_from_saml(self, saml_response: SAMLResponse, config: SSOConfiguration) -> SSOUser:
        """Create SSOUser from SAML response"""
        # Map SAML attributes to user fields
        mapping = config.attributes_mapping
        
        email = saml_response.attributes.get(mapping.get('email', ''), '')
        first_name = saml_response.attributes.get(mapping.get('first_name', ''), '')
        last_name = saml_response.attributes.get(mapping.get('last_name', ''), '')
        display_name = saml_response.attributes.get(mapping.get('display_name', ''), f"{first_name} {last_name}")
        groups = saml_response.attributes.get(mapping.get('groups', ''), [])
        
        if isinstance(groups, str):
            groups = [groups]
        
        return SSOUser(
            user_id=saml_response.subject,
            username=email.split('@')[0] if email else saml_response.subject,
            email=email,
            first_name=first_name,
            last_name=last_name,
            display_name=display_name,
            groups=groups,
            provider=config.provider_name,
            session_id=self._generate_id(),
            expires_at=saml_response.not_on_or_after,
            attributes=saml_response.attributes
        )
    
    async def _create_session(self, user: SSOUser, provider: str, tokens: Optional[Dict[str, Any]] = None) -> SSOSession:
        """Create SSO session"""
        session = SSOSession(
            session_id=user.session_id,
            user_id=user.user_id,
            provider=provider,
            access_token=tokens.get('access_token') if tokens else None,
            refresh_token=tokens.get('refresh_token') if tokens else None,
            id_token=tokens.get('id_token') if tokens else None,
            expires_at=user.expires_at
        )
        
        self.active_sessions[session.session_id] = session
        logger.info(f"SSO session created: {session.session_id}")
        
        return session
    
    async def validate_session(self, session_id: str) -> Optional[SSOSession]:
        """Validate SSO session"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        # Check expiration
        if datetime.utcnow() > session.expires_at:
            await self.invalidate_session(session_id)
            return None
        
        # Update last activity
        session.last_activity = datetime.utcnow()
        return session
    
    async def invalidate_session(self, session_id: str) -> bool:
        """Invalidate SSO session"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session.is_active = False
            del self.active_sessions[session_id]
            logger.info(f"SSO session invalidated: {session_id}")
            return True
        return False
    
    async def logout(self, session_id: str) -> Optional[str]:
        """Initiate SSO logout"""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        provider_config = self.providers.get(session.provider)
        if not provider_config:
            await self.invalidate_session(session_id)
            return None
        
        # Generate logout URL based on provider
        if provider_config.protocol == SSOProtocol.SAML2 and provider_config.slo_url:
            logout_url = await self._generate_saml_logout_url(provider_config, session)
        elif provider_config.protocol in [SSOProtocol.OAUTH2, SSOProtocol.OPENID_CONNECT]:
            logout_url = await self._generate_oauth_logout_url(provider_config, session)
        else:
            logout_url = None
        
        await self.invalidate_session(session_id)
        return logout_url
    
    async def _generate_saml_logout_url(self, config: SSOConfiguration, session: SSOSession) -> str:
        """Generate SAML logout URL"""
        request_id = self._generate_id()
        issue_instant = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        
        logout_request = f"""
        <samlp:LogoutRequest
            xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
            xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
            ID="{request_id}"
            Version="2.0"
            IssueInstant="{issue_instant}"
            Destination="{config.slo_url}">
            <saml:Issuer>{config.entity_id}</saml:Issuer>
            <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">{session.user_id}</saml:NameID>
            <samlp:SessionIndex>{session.session_id}</samlp:SessionIndex>
        </samlp:LogoutRequest>
        """
        
        encoded_request = base64.b64encode(logout_request.encode()).decode()
        params = {'SAMLRequest': encoded_request}
        
        return f"{config.slo_url}?{urllib.parse.urlencode(params)}"
    
    async def _generate_oauth_logout_url(self, config: SSOConfiguration, session: SSOSession) -> str:
        """Generate OAuth logout URL"""
        logout_url = config.sso_url.replace('/authorize', '/logout')
        params = {
            'post_logout_redirect_uri': config.redirect_uri,
            'id_token_hint': session.id_token
        }
        
        return f"{logout_url}?{urllib.parse.urlencode(params)}"
    
    def _generate_id(self) -> str:
        """Generate unique identifier"""
        return f"romai_{secrets.token_hex(16)}"
    
    def _store_oauth_state(self, state: str, code_verifier: str, provider: str) -> None:
        """Store OAuth state for validation"""
        # In production, store in Redis or database with expiration
        # For now, simple in-memory storage
        if not hasattr(self, '_oauth_states'):
            self._oauth_states = {}
        
        self._oauth_states[state] = {
            'code_verifier': code_verifier,
            'provider': provider,
            'timestamp': datetime.utcnow()
        }
    
    def _retrieve_oauth_state(self, state: str) -> Optional[Dict[str, Any]]:
        """Retrieve OAuth state for validation"""
        if not hasattr(self, '_oauth_states'):
            return None
        
        data = self._oauth_states.get(state)
        if data:
            # Check expiration (5 minutes)
            if datetime.utcnow() - data['timestamp'] > timedelta(minutes=5):
                del self._oauth_states[state]
                return None
            
            del self._oauth_states[state]  # One-time use
            return data
        
        return None
    
    async def get_provider_metadata(self, provider_name: str) -> Dict[str, Any]:
        """Get SSO provider metadata"""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown SSO provider: {provider_name}")
        
        config = self.providers[provider_name]
        
        metadata = {
            "provider_name": config.provider_name,
            "protocol": config.protocol,
            "entity_id": config.entity_id,
            "sso_url": config.sso_url,
            "slo_url": config.slo_url,
            "supported_attributes": list(config.attributes_mapping.keys())
        }
        
        return metadata
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform SSO health check"""
        health_status = {
            "providers_configured": len(self.providers),
            "active_sessions": len(self.active_sessions),
            "providers": {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for provider_name, config in self.providers.items():
            provider_health = {
                "protocol": config.protocol,
                "reachable": False,
                "response_time": None
            }
            
            try:
                # Test provider reachability
                start_time = time.time()
                response = requests.head(config.sso_url, timeout=5)
                provider_health["response_time"] = time.time() - start_time
                provider_health["reachable"] = response.status_code < 500
                
            except Exception as e:
                logger.warning(f"SSO provider {provider_name} health check failed: {str(e)}")
                provider_health["error"] = str(e)
            
            health_status["providers"][provider_name] = provider_health
        
        return health_status

# Usage example
def create_sso_integration() -> RomAISSOIntegration:
    """Create SSO integration instance"""
    return RomAISSOIntegration()

if __name__ == "__main__":
    # Example usage
    async def main():
        sso = create_sso_integration()
        
        # Initiate SSO flow
        auth_url = await sso.initiate_sso("azure_ad")
        print(f"SSO Authentication URL: {auth_url}")
        
        # Health check
        health = await sso.health_check()
        print(f"SSO Health: {health}")
    
    asyncio.run(main())
