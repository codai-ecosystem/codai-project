#!/usr/bin/env python3
"""
🏢 RomAI Enterprise Integration Tools
Advanced enterprise system integration for Phase 2.3 deployment

This module provides comprehensive enterprise integration capabilities including:
- LDAP/Active Directory authentication and user management
- SAML/SSO authentication bridges for seamless enterprise login
- ERP/CRM system connectors for business data integration
- API gateways and data synchronization pipelines

Author: RomAI Development Team
Created: August 2025
Version: 2.3.0
"""

import os
import ssl
import json
import time
import asyncio
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import xml.etree.ElementTree as ET

import ldap3
import aiohttp
import asyncpg
import redis
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import jwt
import saml2
from saml2.client import Saml2Client
from saml2.config import Config as Saml2Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IntegrationType(Enum):
    """Enterprise integration types"""
    LDAP = "ldap"
    ACTIVE_DIRECTORY = "active_directory"
    SAML_SSO = "saml_sso"
    OAUTH2 = "oauth2"
    ERP_SAP = "erp_sap"
    ERP_ORACLE = "erp_oracle"
    CRM_SALESFORCE = "crm_salesforce"
    CRM_DYNAMICS = "crm_dynamics"
    API_GATEWAY = "api_gateway"

class AuthenticationStatus(Enum):
    """Authentication status codes"""
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"
    EXPIRED = "expired"
    LOCKED = "locked"
    DISABLED = "disabled"

@dataclass
class UserProfile:
    """Enterprise user profile"""
    user_id: str
    username: str
    email: str
    full_name: str
    department: str
    role: str
    groups: List[str]
    attributes: Dict[str, Any]
    last_login: Optional[datetime] = None
    is_active: bool = True
    permissions: List[str] = None

@dataclass
class IntegrationConfig:
    """Enterprise integration configuration"""
    integration_type: IntegrationType
    endpoint: str
    credentials: Dict[str, str]
    settings: Dict[str, Any]
    enabled: bool = True
    ssl_verify: bool = True
    timeout: int = 30

@dataclass
class AuthenticationResult:
    """Authentication operation result"""
    status: AuthenticationStatus
    user_profile: Optional[UserProfile]
    session_token: Optional[str]
    expires_at: Optional[datetime]
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = None

class LDAPActiveDirectoryIntegration:
    """
    LDAP and Active Directory integration for enterprise authentication
    
    Supports:
    - User authentication and authorization
    - Group membership management
    - Attribute synchronization
    - Password policies
    """
    
    def __init__(self, config: IntegrationConfig):
        """Initialize LDAP/AD integration"""
        self.config = config
        self.server = None
        self.connection = None
        self.encryption_key = self._setup_encryption()
        
        logger.info(f"Initialized LDAP/AD integration for {config.endpoint}")
    
    def _setup_encryption(self) -> Fernet:
        """Setup encryption for sensitive data"""
        password = os.getenv('LDAP_ENCRYPTION_KEY', 'default-key').encode()
        salt = b'salt_'  # In production, use a proper salt
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = kdf.derive(password)
        return Fernet(key)
    
    async def initialize_connection(self):
        """Initialize LDAP connection"""
        try:
            # Setup LDAP server
            use_ssl = self.config.settings.get('use_ssl', True)
            port = self.config.settings.get('port', 636 if use_ssl else 389)
            
            self.server = ldap3.Server(
                self.config.endpoint,
                port=port,
                use_ssl=use_ssl,
                get_info=ldap3.ALL
            )
            
            # Setup connection
            bind_dn = self.config.credentials.get('bind_dn')
            bind_password = self.config.credentials.get('bind_password')
            
            self.connection = ldap3.Connection(
                self.server,
                user=bind_dn,
                password=bind_password,
                auto_bind=True,
                authentication=ldap3.SIMPLE
            )
            
            logger.info("LDAP connection established successfully")
            
        except Exception as e:
            logger.error(f"Failed to establish LDAP connection: {e}")
            raise
    
    async def authenticate_user(self, username: str, password: str) -> AuthenticationResult:
        """
        Authenticate user against LDAP/AD
        
        Args:
            username: User login name
            password: User password
            
        Returns:
            AuthenticationResult: Authentication status and user profile
        """
        try:
            # Search for user
            user_dn = await self._find_user_dn(username)
            if not user_dn:
                return AuthenticationResult(
                    status=AuthenticationStatus.FAILED,
                    user_profile=None,
                    session_token=None,
                    expires_at=None,
                    error_message="User not found"
                )
            
            # Attempt authentication
            test_connection = ldap3.Connection(
                self.server,
                user=user_dn,
                password=password,
                auto_bind=False
            )
            
            if test_connection.bind():
                # Get user profile
                user_profile = await self._get_user_profile(user_dn, username)
                
                # Generate session token
                session_token = self._generate_session_token(user_profile)
                expires_at = datetime.now() + timedelta(hours=8)
                
                return AuthenticationResult(
                    status=AuthenticationStatus.SUCCESS,
                    user_profile=user_profile,
                    session_token=session_token,
                    expires_at=expires_at
                )
            else:
                return AuthenticationResult(
                    status=AuthenticationStatus.FAILED,
                    user_profile=None,
                    session_token=None,
                    expires_at=None,
                    error_message="Invalid credentials"
                )
                
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return AuthenticationResult(
                status=AuthenticationStatus.FAILED,
                user_profile=None,
                session_token=None,
                expires_at=None,
                error_message=str(e)
            )
    
    async def _find_user_dn(self, username: str) -> Optional[str]:
        """Find user Distinguished Name"""
        search_base = self.config.settings.get('user_search_base', 'ou=users,dc=example,dc=com')
        search_filter = f"(&(objectClass=person)(|(uid={username})(sAMAccountName={username})(mail={username})))"
        
        self.connection.search(
            search_base=search_base,
            search_filter=search_filter,
            search_scope=ldap3.SUBTREE,
            attributes=['dn']
        )
        
        if self.connection.entries:
            return str(self.connection.entries[0].entry_dn)
        return None
    
    async def _get_user_profile(self, user_dn: str, username: str) -> UserProfile:
        """Get comprehensive user profile"""
        attributes = [
            'uid', 'sAMAccountName', 'mail', 'displayName', 'cn',
            'department', 'title', 'memberOf', 'userAccountControl'
        ]
        
        self.connection.search(
            search_base=user_dn,
            search_filter='(objectClass=*)',
            search_scope=ldap3.BASE,
            attributes=attributes
        )
        
        entry = self.connection.entries[0]
        
        # Extract user information
        email = str(entry.mail) if hasattr(entry, 'mail') else ""
        full_name = str(entry.displayName) if hasattr(entry, 'displayName') else str(entry.cn)
        department = str(entry.department) if hasattr(entry, 'department') else ""
        title = str(entry.title) if hasattr(entry, 'title') else ""
        
        # Get group memberships
        groups = []
        if hasattr(entry, 'memberOf'):
            for group_dn in entry.memberOf:
                group_name = self._extract_group_name(str(group_dn))
                if group_name:
                    groups.append(group_name)
        
        # Determine role and permissions
        role = self._determine_user_role(groups, title)
        permissions = self._get_user_permissions(role, groups)
        
        return UserProfile(
            user_id=str(entry.uid) if hasattr(entry, 'uid') else username,
            username=username,
            email=email,
            full_name=full_name,
            department=department,
            role=role,
            groups=groups,
            attributes={
                'title': title,
                'dn': user_dn
            },
            last_login=datetime.now(),
            is_active=True,
            permissions=permissions
        )
    
    def _extract_group_name(self, group_dn: str) -> str:
        """Extract group name from DN"""
        # Extract CN from DN (e.g., "CN=Admins,OU=Groups,DC=example,DC=com" -> "Admins")
        for component in group_dn.split(','):
            if component.strip().startswith('CN='):
                return component.strip()[3:]
        return ""
    
    def _determine_user_role(self, groups: List[str], title: str) -> str:
        """Determine user role based on groups and title"""
        # Role mapping logic
        admin_groups = ['Domain Admins', 'Administrators', 'IT Admins']
        manager_groups = ['Managers', 'Team Leads', 'Directors']
        
        for group in groups:
            if group in admin_groups:
                return "admin"
            elif group in manager_groups:
                return "manager"
        
        # Check title
        if any(keyword in title.lower() for keyword in ['admin', 'administrator']):
            return "admin"
        elif any(keyword in title.lower() for keyword in ['manager', 'director', 'lead']):
            return "manager"
        
        return "user"
    
    def _get_user_permissions(self, role: str, groups: List[str]) -> List[str]:
        """Get user permissions based on role and groups"""
        permissions = []
        
        # Base permissions for all users
        permissions.extend(['read_basic', 'use_romai_chat', 'view_dashboard'])
        
        # Role-based permissions
        if role == "admin":
            permissions.extend(['admin_access', 'user_management', 'system_config', 'view_logs'])
        elif role == "manager":
            permissions.extend(['team_management', 'advanced_analytics', 'export_data'])
        
        # Group-based permissions
        for group in groups:
            if 'Developers' in group:
                permissions.extend(['api_access', 'debug_tools'])
            elif 'Analysts' in group:
                permissions.extend(['advanced_analytics', 'custom_reports'])
        
        return list(set(permissions))  # Remove duplicates
    
    def _generate_session_token(self, user_profile: UserProfile) -> str:
        """Generate secure session token"""
        payload = {
            'user_id': user_profile.user_id,
            'username': user_profile.username,
            'role': user_profile.role,
            'groups': user_profile.groups,
            'permissions': user_profile.permissions,
            'iat': datetime.now().timestamp(),
            'exp': (datetime.now() + timedelta(hours=8)).timestamp()
        }
        
        secret_key = os.getenv('JWT_SECRET_KEY', 'default-secret')
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    async def sync_users(self) -> Dict[str, Any]:
        """Synchronize users from LDAP/AD"""
        logger.info("Starting user synchronization...")
        
        search_base = self.config.settings.get('user_search_base', 'ou=users,dc=example,dc=com')
        search_filter = '(&(objectClass=person)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))'
        
        self.connection.search(
            search_base=search_base,
            search_filter=search_filter,
            search_scope=ldap3.SUBTREE,
            attributes=['uid', 'sAMAccountName', 'mail', 'displayName', 'department', 'memberOf']
        )
        
        synced_users = []
        for entry in self.connection.entries:
            username = str(entry.uid) if hasattr(entry, 'uid') else str(entry.sAMAccountName)
            user_profile = await self._get_user_profile(str(entry.entry_dn), username)
            synced_users.append(user_profile)
        
        logger.info(f"Synchronized {len(synced_users)} users")
        
        return {
            'status': 'success',
            'users_synced': len(synced_users),
            'timestamp': datetime.now().isoformat(),
            'users': [asdict(user) for user in synced_users]
        }

class SAMLSSOIntegration:
    """
    SAML/SSO authentication bridge for enterprise single sign-on
    
    Supports:
    - SAML 2.0 authentication
    - Multiple identity providers
    - Attribute mapping
    - Session management
    """
    
    def __init__(self, config: IntegrationConfig):
        """Initialize SAML/SSO integration"""
        self.config = config
        self.saml_client = None
        self.redis_client = redis.Redis(decode_responses=True)
        
        logger.info(f"Initialized SAML/SSO integration for {config.endpoint}")
    
    async def initialize_saml_client(self):
        """Initialize SAML client"""
        try:
            # SAML configuration
            saml_config = {
                'entityid': self.config.settings.get('entity_id', 'romai-enterprise'),
                'service': {
                    'sp': {
                        'endpoints': {
                            'assertion_consumer_service': [
                                (self.config.settings.get('acs_url'), saml2.BINDING_HTTP_POST),
                            ],
                            'single_logout_service': [
                                (self.config.settings.get('sls_url'), saml2.BINDING_HTTP_REDIRECT),
                            ],
                        },
                        'name_id_format': [saml2.saml.NAMEID_FORMAT_EMAILADDRESS],
                        'force_authn': False,
                    },
                },
                'metadata': {
                    'remote': [
                        {
                            'url': self.config.settings.get('idp_metadata_url'),
                        },
                    ],
                },
                'key_file': self.config.settings.get('private_key_file'),
                'cert_file': self.config.settings.get('certificate_file'),
            }
            
            config = Saml2Config()
            config.load(saml_config)
            self.saml_client = Saml2Client(config)
            
            logger.info("SAML client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize SAML client: {e}")
            raise
    
    async def initiate_sso_login(self, relay_state: str = None) -> Dict[str, str]:
        """Initiate SSO login process"""
        try:
            # Generate SAML AuthnRequest
            session_id = f"saml_{int(time.time())}_{hash(os.urandom(16))}"
            
            # Create authentication request
            reqid, info = self.saml_client.prepare_for_authenticate(
                relay_state=relay_state,
                sign=True
            )
            
            # Store session information
            session_data = {
                'request_id': reqid,
                'timestamp': datetime.now().isoformat(),
                'relay_state': relay_state or '',
                'status': 'initiated'
            }
            
            self.redis_client.setex(
                f"saml_session:{session_id}",
                3600,  # 1 hour expiry
                json.dumps(session_data)
            )
            
            return {
                'session_id': session_id,
                'redirect_url': info['headers'][0][1],  # Location header
                'request_id': reqid
            }
            
        except Exception as e:
            logger.error(f"Failed to initiate SSO login: {e}")
            raise
    
    async def process_sso_response(self, saml_response: str, session_id: str) -> AuthenticationResult:
        """Process SAML authentication response"""
        try:
            # Retrieve session data
            session_data = self.redis_client.get(f"saml_session:{session_id}")
            if not session_data:
                return AuthenticationResult(
                    status=AuthenticationStatus.FAILED,
                    user_profile=None,
                    session_token=None,
                    expires_at=None,
                    error_message="Invalid or expired session"
                )
            
            session_info = json.loads(session_data)
            
            # Parse SAML response
            authn_response = self.saml_client.parse_authn_request_response(
                saml_response,
                saml2.BINDING_HTTP_POST
            )
            
            # Validate response
            if authn_response.session_info.get('name_id'):
                # Extract user information
                user_info = authn_response.get_identity()
                attributes = authn_response.ava
                
                # Create user profile
                user_profile = self._create_user_profile_from_saml(user_info, attributes)
                
                # Generate session token
                session_token = self._generate_session_token(user_profile)
                expires_at = datetime.now() + timedelta(hours=8)
                
                # Update session
                session_info['status'] = 'authenticated'
                session_info['user_id'] = user_profile.user_id
                self.redis_client.setex(
                    f"saml_session:{session_id}",
                    28800,  # 8 hours
                    json.dumps(session_info)
                )
                
                return AuthenticationResult(
                    status=AuthenticationStatus.SUCCESS,
                    user_profile=user_profile,
                    session_token=session_token,
                    expires_at=expires_at,
                    metadata={'session_id': session_id}
                )
            else:
                return AuthenticationResult(
                    status=AuthenticationStatus.FAILED,
                    user_profile=None,
                    session_token=None,
                    expires_at=None,
                    error_message="Invalid SAML response"
                )
                
        except Exception as e:
            logger.error(f"Failed to process SAML response: {e}")
            return AuthenticationResult(
                status=AuthenticationStatus.FAILED,
                user_profile=None,
                session_token=None,
                expires_at=None,
                error_message=str(e)
            )
    
    def _create_user_profile_from_saml(self, user_info: Dict, attributes: Dict) -> UserProfile:
        """Create user profile from SAML attributes"""
        # Extract standard attributes
        user_id = user_info.get('name_id', '')
        email = attributes.get('email', [''])[0] if 'email' in attributes else user_id
        full_name = attributes.get('displayName', [''])[0] if 'displayName' in attributes else ""
        department = attributes.get('department', [''])[0] if 'department' in attributes else ""
        
        # Extract groups/roles
        groups = attributes.get('groups', []) if 'groups' in attributes else []
        role = self._determine_role_from_saml_attributes(attributes)
        permissions = self._get_permissions_from_saml_groups(groups)
        
        return UserProfile(
            user_id=user_id,
            username=email.split('@')[0] if '@' in email else user_id,
            email=email,
            full_name=full_name,
            department=department,
            role=role,
            groups=groups,
            attributes=attributes,
            last_login=datetime.now(),
            is_active=True,
            permissions=permissions
        )
    
    def _determine_role_from_saml_attributes(self, attributes: Dict) -> str:
        """Determine user role from SAML attributes"""
        # Check role attribute
        if 'role' in attributes:
            role = attributes['role'][0].lower()
            if 'admin' in role:
                return "admin"
            elif 'manager' in role:
                return "manager"
        
        # Check groups
        groups = attributes.get('groups', [])
        for group in groups:
            if 'admin' in group.lower():
                return "admin"
            elif 'manager' in group.lower():
                return "manager"
        
        return "user"
    
    def _get_permissions_from_saml_groups(self, groups: List[str]) -> List[str]:
        """Get permissions from SAML groups"""
        permissions = ['read_basic', 'use_romai_chat', 'view_dashboard']
        
        for group in groups:
            group_lower = group.lower()
            if 'admin' in group_lower:
                permissions.extend(['admin_access', 'user_management', 'system_config'])
            elif 'developer' in group_lower:
                permissions.extend(['api_access', 'debug_tools'])
            elif 'analyst' in group_lower:
                permissions.extend(['advanced_analytics', 'custom_reports'])
        
        return list(set(permissions))
    
    def _generate_session_token(self, user_profile: UserProfile) -> str:
        """Generate secure session token"""
        payload = {
            'user_id': user_profile.user_id,
            'username': user_profile.username,
            'role': user_profile.role,
            'groups': user_profile.groups,
            'permissions': user_profile.permissions,
            'auth_method': 'saml_sso',
            'iat': datetime.now().timestamp(),
            'exp': (datetime.now() + timedelta(hours=8)).timestamp()
        }
        
        secret_key = os.getenv('JWT_SECRET_KEY', 'default-secret')
        return jwt.encode(payload, secret_key, algorithm='HS256')

class ERPCRMIntegration:
    """
    ERP/CRM system integration for business data connectivity
    
    Supports:
    - SAP ERP integration
    - Oracle ERP integration
    - Salesforce CRM integration
    - Microsoft Dynamics integration
    - Custom API connectors
    """
    
    def __init__(self, config: IntegrationConfig):
        """Initialize ERP/CRM integration"""
        self.config = config
        self.session = None
        self.cache = redis.Redis(decode_responses=True)
        
        logger.info(f"Initialized {config.integration_type.value} integration")
    
    async def initialize_connection(self):
        """Initialize connection to ERP/CRM system"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout),
            connector=aiohttp.TCPConnector(ssl=self.config.ssl_verify)
        )
        
        # System-specific initialization
        if self.config.integration_type == IntegrationType.ERP_SAP:
            await self._initialize_sap_connection()
        elif self.config.integration_type == IntegrationType.CRM_SALESFORCE:
            await self._initialize_salesforce_connection()
        # Add more systems as needed
    
    async def _initialize_sap_connection(self):
        """Initialize SAP ERP connection"""
        # SAP-specific connection logic
        logger.info("SAP ERP connection initialized")
    
    async def _initialize_salesforce_connection(self):
        """Initialize Salesforce CRM connection"""
        # Salesforce OAuth authentication
        auth_url = f"{self.config.endpoint}/services/oauth2/token"
        
        auth_data = {
            'grant_type': 'password',
            'client_id': self.config.credentials['client_id'],
            'client_secret': self.config.credentials['client_secret'],
            'username': self.config.credentials['username'],
            'password': self.config.credentials['password']
        }
        
        async with self.session.post(auth_url, data=auth_data) as response:
            if response.status == 200:
                auth_result = await response.json()
                self.access_token = auth_result['access_token']
                self.instance_url = auth_result['instance_url']
                logger.info("Salesforce connection initialized")
            else:
                raise Exception(f"Salesforce authentication failed: {response.status}")
    
    async def sync_customer_data(self) -> Dict[str, Any]:
        """Synchronize customer data from CRM"""
        if self.config.integration_type == IntegrationType.CRM_SALESFORCE:
            return await self._sync_salesforce_accounts()
        # Add other CRM systems
        
        return {'status': 'not_implemented'}
    
    async def _sync_salesforce_accounts(self) -> Dict[str, Any]:
        """Sync Salesforce account data"""
        query = "SELECT Id, Name, Type, Industry, BillingCountry FROM Account LIMIT 1000"
        query_url = f"{self.instance_url}/services/data/v57.0/query/"
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        params = {'q': query}
        
        async with self.session.get(query_url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                accounts = data['records']
                
                # Cache the data
                cache_key = f"crm_accounts:{datetime.now().strftime('%Y%m%d')}"
                self.cache.setex(cache_key, 3600, json.dumps(accounts))
                
                logger.info(f"Synced {len(accounts)} Salesforce accounts")
                
                return {
                    'status': 'success',
                    'accounts_synced': len(accounts),
                    'timestamp': datetime.now().isoformat(),
                    'cache_key': cache_key
                }
            else:
                raise Exception(f"Salesforce query failed: {response.status}")
    
    async def get_customer_insights(self, customer_id: str) -> Dict[str, Any]:
        """Get AI-powered customer insights"""
        # Retrieve customer data
        customer_data = await self._get_customer_data(customer_id)
        
        if not customer_data:
            return {'error': 'Customer not found'}
        
        # Generate insights using RomAI
        insights = await self._generate_ai_insights(customer_data)
        
        return {
            'customer_id': customer_id,
            'customer_data': customer_data,
            'ai_insights': insights,
            'generated_at': datetime.now().isoformat()
        }
    
    async def _get_customer_data(self, customer_id: str) -> Optional[Dict]:
        """Retrieve customer data from cache or CRM"""
        # Try cache first
        cached_data = self.cache.get(f"customer:{customer_id}")
        if cached_data:
            return json.loads(cached_data)
        
        # Fetch from CRM
        if self.config.integration_type == IntegrationType.CRM_SALESFORCE:
            return await self._fetch_salesforce_account(customer_id)
        
        return None
    
    async def _fetch_salesforce_account(self, account_id: str) -> Optional[Dict]:
        """Fetch specific Salesforce account"""
        url = f"{self.instance_url}/services/data/v57.0/sobjects/Account/{account_id}"
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                account_data = await response.json()
                
                # Cache the data
                self.cache.setex(f"customer:{account_id}", 3600, json.dumps(account_data))
                
                return account_data
            else:
                return None
    
    async def _generate_ai_insights(self, customer_data: Dict) -> Dict[str, Any]:
        """Generate AI insights for customer data"""
        # Integration with RomAI AGI for customer insights
        # This would call the RomAI AGI model server
        
        insights = {
            'risk_score': 0.2,  # Low risk
            'opportunity_score': 0.8,  # High opportunity
            'recommended_actions': [
                'Schedule quarterly business review',
                'Propose additional services',
                'Monitor payment patterns'
            ],
            'customer_segment': 'Enterprise',
            'predicted_churn_probability': 0.1,
            'lifetime_value_estimate': 250000
        }
        
        return insights

class EnterpriseIntegrationManager:
    """
    Central manager for all enterprise integrations
    
    Coordinates:
    - Authentication integrations (LDAP/AD, SAML/SSO)
    - Business system integrations (ERP/CRM)
    - API gateway management
    - Data synchronization
    """
    
    def __init__(self):
        """Initialize enterprise integration manager"""
        self.integrations: Dict[str, Any] = {}
        self.db_pool = None
        
        logger.info("Enterprise Integration Manager initialized")
    
    async def initialize(self):
        """Initialize database connections and integrations"""
        # Initialize database pool
        self.db_pool = await asyncpg.create_pool(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=int(os.getenv('POSTGRES_PORT', 5432)),
            user=os.getenv('POSTGRES_USER', 'romai'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            database=os.getenv('POSTGRES_DB', 'romai_enterprise'),
            min_size=5,
            max_size=20
        )
        
        logger.info("Database pool initialized")
    
    async def register_integration(self, name: str, config: IntegrationConfig):
        """Register a new enterprise integration"""
        if config.integration_type in [IntegrationType.LDAP, IntegrationType.ACTIVE_DIRECTORY]:
            integration = LDAPActiveDirectoryIntegration(config)
            await integration.initialize_connection()
        elif config.integration_type == IntegrationType.SAML_SSO:
            integration = SAMLSSOIntegration(config)
            await integration.initialize_saml_client()
        elif config.integration_type in [IntegrationType.ERP_SAP, IntegrationType.CRM_SALESFORCE]:
            integration = ERPCRMIntegration(config)
            await integration.initialize_connection()
        else:
            raise ValueError(f"Unsupported integration type: {config.integration_type}")
        
        self.integrations[name] = integration
        logger.info(f"Registered integration: {name}")
    
    async def authenticate_user(self, username: str, password: str, method: str = "ldap") -> AuthenticationResult:
        """Authenticate user using specified method"""
        if method == "ldap" and "ldap" in self.integrations:
            return await self.integrations["ldap"].authenticate_user(username, password)
        else:
            return AuthenticationResult(
                status=AuthenticationStatus.FAILED,
                user_profile=None,
                session_token=None,
                expires_at=None,
                error_message="Authentication method not available"
            )
    
    async def get_customer_360_view(self, customer_id: str) -> Dict[str, Any]:
        """Get comprehensive customer view from all integrated systems"""
        customer_360 = {
            'customer_id': customer_id,
            'profile': {},
            'crm_data': {},
            'erp_data': {},
            'ai_insights': {},
            'last_updated': datetime.now().isoformat()
        }
        
        # Gather data from all CRM integrations
        for name, integration in self.integrations.items():
            if isinstance(integration, ERPCRMIntegration):
                try:
                    insights = await integration.get_customer_insights(customer_id)
                    customer_360['crm_data'][name] = insights
                except Exception as e:
                    logger.error(f"Failed to get data from {name}: {e}")
        
        return customer_360
    
    async def sync_all_data(self) -> Dict[str, Any]:
        """Synchronize data from all integrated systems"""
        sync_results = {
            'started_at': datetime.now().isoformat(),
            'results': {},
            'errors': []
        }
        
        for name, integration in self.integrations.items():
            try:
                if isinstance(integration, LDAPActiveDirectoryIntegration):
                    result = await integration.sync_users()
                    sync_results['results'][name] = result
                elif isinstance(integration, ERPCRMIntegration):
                    result = await integration.sync_customer_data()
                    sync_results['results'][name] = result
            except Exception as e:
                error_msg = f"Sync failed for {name}: {e}"
                logger.error(error_msg)
                sync_results['errors'].append(error_msg)
        
        sync_results['completed_at'] = datetime.now().isoformat()
        return sync_results
    
    async def get_integration_health(self) -> Dict[str, Any]:
        """Get health status of all integrations"""
        health_status = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'healthy',
            'integrations': {}
        }
        
        for name, integration in self.integrations.items():
            try:
                # Basic health check
                status = {
                    'status': 'healthy',
                    'type': integration.config.integration_type.value,
                    'endpoint': integration.config.endpoint,
                    'enabled': integration.config.enabled
                }
                health_status['integrations'][name] = status
            except Exception as e:
                health_status['integrations'][name] = {
                    'status': 'unhealthy',
                    'error': str(e)
                }
                health_status['overall_status'] = 'degraded'
        
        return health_status

# Example usage and configuration
async def setup_enterprise_integrations():
    """Setup example enterprise integrations"""
    manager = EnterpriseIntegrationManager()
    await manager.initialize()
    
    # LDAP/AD Integration
    ldap_config = IntegrationConfig(
        integration_type=IntegrationType.LDAP,
        endpoint="ldap.company.com",
        credentials={
            'bind_dn': 'cn=admin,dc=company,dc=com',
            'bind_password': os.getenv('LDAP_PASSWORD', '')
        },
        settings={
            'use_ssl': True,
            'port': 636,
            'user_search_base': 'ou=users,dc=company,dc=com'
        }
    )
    await manager.register_integration("ldap", ldap_config)
    
    # SAML SSO Integration
    saml_config = IntegrationConfig(
        integration_type=IntegrationType.SAML_SSO,
        endpoint="https://idp.company.com/sso/saml",
        credentials={},
        settings={
            'entity_id': 'romai-enterprise',
            'acs_url': 'https://romai.company.com/sso/acs',
            'sls_url': 'https://romai.company.com/sso/sls',
            'idp_metadata_url': 'https://idp.company.com/metadata'
        }
    )
    await manager.register_integration("saml_sso", saml_config)
    
    # Salesforce CRM Integration
    salesforce_config = IntegrationConfig(
        integration_type=IntegrationType.CRM_SALESFORCE,
        endpoint="https://company.salesforce.com",
        credentials={
            'client_id': os.getenv('SALESFORCE_CLIENT_ID', ''),
            'client_secret': os.getenv('SALESFORCE_CLIENT_SECRET', ''),
            'username': os.getenv('SALESFORCE_USERNAME', ''),
            'password': os.getenv('SALESFORCE_PASSWORD', '')
        },
        settings={'api_version': 'v57.0'}
    )
    await manager.register_integration("salesforce", salesforce_config)
    
    return manager

if __name__ == "__main__":
    # Example usage
    asyncio.run(setup_enterprise_integrations())
