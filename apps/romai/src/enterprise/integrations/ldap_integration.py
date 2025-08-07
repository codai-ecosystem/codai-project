# 🏢 RomAI Enterprise LDAP/Active Directory Integration
# Production-grade LDAP authentication and user synchronization

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator
import ldap3
from ldap3 import Server, Connection, ALL, NTLM, SIMPLE, SUBTREE, MODIFY_REPLACE, MODIFY_ADD, MODIFY_DELETE
from ldap3.core.exceptions import LDAPException, LDAPBindError
import asyncio
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
import hashlib
import hmac
from functools import wraps
import ssl
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LDAPAuthMethod(str, Enum):
    """LDAP authentication methods"""
    SIMPLE = "simple"
    NTLM = "ntlm"
    KERBEROS = "kerberos"
    SASL = "sasl"

class LDAPSecurityLevel(str, Enum):
    """LDAP security levels"""
    NONE = "none"
    TLS = "tls"
    SSL = "ssl"
    START_TLS = "start_tls"

class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOCKED = "locked"
    DISABLED = "disabled"
    EXPIRED = "expired"

@dataclass
class LDAPConfiguration:
    """LDAP server configuration"""
    server_uri: str
    base_dn: str
    bind_dn: str
    bind_password: str
    user_search_base: str
    group_search_base: str
    auth_method: LDAPAuthMethod = LDAPAuthMethod.SIMPLE
    security_level: LDAPSecurityLevel = LDAPSecurityLevel.TLS
    port: int = 389
    ssl_port: int = 636
    timeout: int = 30
    use_ssl: bool = True
    validate_certificates: bool = True
    ca_cert_file: Optional[str] = None
    
class LDAPUser(BaseModel):
    """LDAP user representation"""
    username: str = Field(..., description="Username/sAMAccountName")
    email: str = Field(..., description="Email address")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    display_name: str = Field(..., description="Display name")
    department: Optional[str] = Field(None, description="Department")
    title: Optional[str] = Field(None, description="Job title")
    phone: Optional[str] = Field(None, description="Phone number")
    manager: Optional[str] = Field(None, description="Manager DN")
    groups: List[str] = Field(default_factory=list, description="Group memberships")
    status: UserStatus = Field(UserStatus.ACTIVE, description="Account status")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    created_date: Optional[datetime] = Field(None, description="Account creation date")
    modified_date: Optional[datetime] = Field(None, description="Last modification date")
    distinguished_name: str = Field(..., description="LDAP Distinguished Name")
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

class LDAPGroup(BaseModel):
    """LDAP group representation"""
    name: str = Field(..., description="Group name")
    display_name: str = Field(..., description="Group display name")
    description: Optional[str] = Field(None, description="Group description")
    members: List[str] = Field(default_factory=list, description="Group members (DNs)")
    member_count: int = Field(0, description="Number of members")
    distinguished_name: str = Field(..., description="LDAP Distinguished Name")
    group_type: Optional[str] = Field(None, description="Group type")
    created_date: Optional[datetime] = Field(None, description="Group creation date")
    
class LDAPSyncResult(BaseModel):
    """LDAP synchronization result"""
    success: bool = Field(..., description="Sync success status")
    users_synced: int = Field(0, description="Number of users synchronized")
    groups_synced: int = Field(0, description="Number of groups synchronized")
    users_added: int = Field(0, description="New users added")
    users_updated: int = Field(0, description="Users updated")
    users_disabled: int = Field(0, description="Users disabled")
    groups_added: int = Field(0, description="New groups added")
    groups_updated: int = Field(0, description="Groups updated")
    errors: List[str] = Field(default_factory=list, description="Sync errors")
    sync_duration: float = Field(0.0, description="Sync duration in seconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Sync timestamp")

class LDAPAuthenticationResult(BaseModel):
    """LDAP authentication result"""
    success: bool = Field(..., description="Authentication success")
    user: Optional[LDAPUser] = Field(None, description="Authenticated user")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    auth_timestamp: datetime = Field(default_factory=datetime.utcnow, description="Authentication timestamp")
    session_token: Optional[str] = Field(None, description="Session token if successful")

class RomAILDAPIntegration:
    """
    🏢 RomAI Enterprise LDAP/Active Directory Integration
    
    Provides comprehensive LDAP authentication, user synchronization,
    and enterprise directory integration capabilities.
    """
    
    def __init__(self, config: LDAPConfiguration):
        """Initialize LDAP integration with configuration"""
        self.config = config
        self.connection: Optional[Connection] = None
        self.server: Optional[Server] = None
        self.is_connected = False
        self.last_sync: Optional[datetime] = None
        self.sync_stats = {}
        
        # Initialize server connection
        self._initialize_server()
        
    def _initialize_server(self) -> None:
        """Initialize LDAP server connection"""
        try:
            # Configure SSL/TLS
            tls_config = None
            if self.config.security_level in [LDAPSecurityLevel.TLS, LDAPSecurityLevel.SSL]:
                tls_config = ldap3.Tls(
                    validate=ssl.CERT_REQUIRED if self.config.validate_certificates else ssl.CERT_NONE,
                    ca_certs_file=self.config.ca_cert_file
                )
            
            # Determine port
            port = self.config.ssl_port if self.config.use_ssl else self.config.port
            
            # Create server instance
            self.server = Server(
                host=self.config.server_uri,
                port=port,
                use_ssl=self.config.use_ssl,
                tls=tls_config,
                get_info=ALL,
                connect_timeout=self.config.timeout
            )
            
            logger.info(f"LDAP server initialized: {self.config.server_uri}:{port}")
            
        except Exception as e:
            logger.error(f"Failed to initialize LDAP server: {str(e)}")
            raise
    
    async def connect(self) -> bool:
        """Establish LDAP connection with retry logic"""
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Create connection
                auth_method = SIMPLE
                if self.config.auth_method == LDAPAuthMethod.NTLM:
                    auth_method = NTLM
                
                self.connection = Connection(
                    server=self.server,
                    user=self.config.bind_dn,
                    password=self.config.bind_password,
                    authentication=auth_method,
                    auto_bind=True,
                    auto_range=True,
                    raise_exceptions=True
                )
                
                # Test connection
                if self.connection.bind():
                    self.is_connected = True
                    logger.info("LDAP connection established successfully")
                    return True
                else:
                    raise LDAPBindError("Failed to bind to LDAP server")
                    
            except (LDAPException, LDAPBindError) as e:
                logger.warning(f"LDAP connection attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    logger.error("All LDAP connection attempts failed")
                    return False
        
        return False
    
    async def disconnect(self) -> None:
        """Close LDAP connection"""
        if self.connection:
            try:
                self.connection.unbind()
                self.is_connected = False
                logger.info("LDAP connection closed")
            except Exception as e:
                logger.warning(f"Error closing LDAP connection: {str(e)}")
    
    async def authenticate_user(self, username: str, password: str) -> LDAPAuthenticationResult:
        """
        Authenticate user against LDAP/Active Directory
        
        Args:
            username: Username to authenticate
            password: User password
            
        Returns:
            LDAPAuthenticationResult with authentication status and user info
        """
        try:
            if not self.is_connected:
                if not await self.connect():
                    return LDAPAuthenticationResult(
                        success=False,
                        error_message="Failed to connect to LDAP server"
                    )
            
            # Search for user
            user_filter = f"(sAMAccountName={username})"
            if not self.connection.search(
                search_base=self.config.user_search_base,
                search_filter=user_filter,
                search_scope=SUBTREE,
                attributes=['*']
            ):
                return LDAPAuthenticationResult(
                    success=False,
                    error_message="User not found"
                )
            
            if not self.connection.entries:
                return LDAPAuthenticationResult(
                    success=False,
                    error_message="User not found in directory"
                )
            
            user_entry = self.connection.entries[0]
            user_dn = str(user_entry.entry_dn)
            
            # Attempt authentication with user credentials
            try:
                auth_connection = Connection(
                    server=self.server,
                    user=user_dn,
                    password=password,
                    authentication=SIMPLE,
                    raise_exceptions=True
                )
                
                if auth_connection.bind():
                    # Authentication successful - get user info
                    user = await self._create_user_from_entry(user_entry)
                    
                    # Generate session token
                    session_token = self._generate_session_token(username)
                    
                    auth_connection.unbind()
                    
                    logger.info(f"User {username} authenticated successfully")
                    
                    return LDAPAuthenticationResult(
                        success=True,
                        user=user,
                        session_token=session_token
                    )
                else:
                    return LDAPAuthenticationResult(
                        success=False,
                        error_message="Invalid credentials"
                    )
                    
            except LDAPBindError:
                return LDAPAuthenticationResult(
                    success=False,
                    error_message="Invalid username or password"
                )
                
        except Exception as e:
            logger.error(f"LDAP authentication error: {str(e)}")
            return LDAPAuthenticationResult(
                success=False,
                error_message=f"Authentication error: {str(e)}"
            )
    
    async def get_user(self, username: str) -> Optional[LDAPUser]:
        """Get user information from LDAP"""
        try:
            if not self.is_connected:
                if not await self.connect():
                    return None
            
            user_filter = f"(sAMAccountName={username})"
            if self.connection.search(
                search_base=self.config.user_search_base,
                search_filter=user_filter,
                search_scope=SUBTREE,
                attributes=['*']
            ):
                if self.connection.entries:
                    return await self._create_user_from_entry(self.connection.entries[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {username}: {str(e)}")
            return None
    
    async def get_user_groups(self, username: str) -> List[LDAPGroup]:
        """Get groups for a specific user"""
        try:
            user = await self.get_user(username)
            if not user:
                return []
            
            groups = []
            for group_dn in user.groups:
                group = await self.get_group_by_dn(group_dn)
                if group:
                    groups.append(group)
            
            return groups
            
        except Exception as e:
            logger.error(f"Error getting groups for user {username}: {str(e)}")
            return []
    
    async def get_group_by_dn(self, group_dn: str) -> Optional[LDAPGroup]:
        """Get group information by Distinguished Name"""
        try:
            if not self.is_connected:
                if not await self.connect():
                    return None
            
            if self.connection.search(
                search_base=group_dn,
                search_filter="(objectClass=group)",
                search_scope=SUBTREE,
                attributes=['*']
            ):
                if self.connection.entries:
                    return await self._create_group_from_entry(self.connection.entries[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting group {group_dn}: {str(e)}")
            return None
    
    async def sync_users(self, page_size: int = 100) -> LDAPSyncResult:
        """
        Synchronize users from LDAP to local database
        
        Args:
            page_size: Number of users to process per page
            
        Returns:
            LDAPSyncResult with synchronization statistics
        """
        start_time = time.time()
        result = LDAPSyncResult(success=False)
        
        try:
            if not self.is_connected:
                if not await self.connect():
                    result.errors.append("Failed to connect to LDAP server")
                    return result
            
            # Search for all users
            user_filter = "(objectClass=user)"
            users_processed = 0
            users_added = 0
            users_updated = 0
            users_disabled = 0
            errors = []
            
            # Use paged search for large directories
            if self.connection.search(
                search_base=self.config.user_search_base,
                search_filter=user_filter,
                search_scope=SUBTREE,
                attributes=['*'],
                paged_size=page_size
            ):
                while True:
                    for entry in self.connection.entries:
                        try:
                            user = await self._create_user_from_entry(entry)
                            
                            # Here you would typically save to your database
                            # For now, we'll just log the sync operation
                            logger.info(f"Syncing user: {user.username}")
                            users_processed += 1
                            
                            # Simulate database operations
                            if await self._user_exists_in_db(user.username):
                                # Update existing user
                                await self._update_user_in_db(user)
                                users_updated += 1
                            else:
                                # Add new user
                                await self._add_user_to_db(user)
                                users_added += 1
                                
                        except Exception as e:
                            error_msg = f"Error processing user {entry.entry_dn}: {str(e)}"
                            errors.append(error_msg)
                            logger.error(error_msg)
                    
                    # Get next page
                    if not self.connection.extend.standard.paged_search_continue():
                        break
            
            # Update result
            result.success = True
            result.users_synced = users_processed
            result.users_added = users_added
            result.users_updated = users_updated
            result.users_disabled = users_disabled
            result.errors = errors
            result.sync_duration = time.time() - start_time
            
            self.last_sync = datetime.utcnow()
            logger.info(f"User sync completed: {users_processed} users processed")
            
        except Exception as e:
            error_msg = f"User sync failed: {str(e)}"
            result.errors.append(error_msg)
            logger.error(error_msg)
        
        result.sync_duration = time.time() - start_time
        return result
    
    async def sync_groups(self) -> LDAPSyncResult:
        """Synchronize groups from LDAP to local database"""
        start_time = time.time()
        result = LDAPSyncResult(success=False)
        
        try:
            if not self.is_connected:
                if not await self.connect():
                    result.errors.append("Failed to connect to LDAP server")
                    return result
            
            # Search for all groups
            group_filter = "(objectClass=group)"
            groups_processed = 0
            groups_added = 0
            groups_updated = 0
            errors = []
            
            if self.connection.search(
                search_base=self.config.group_search_base,
                search_filter=group_filter,
                search_scope=SUBTREE,
                attributes=['*']
            ):
                for entry in self.connection.entries:
                    try:
                        group = await self._create_group_from_entry(entry)
                        
                        logger.info(f"Syncing group: {group.name}")
                        groups_processed += 1
                        
                        # Simulate database operations
                        if await self._group_exists_in_db(group.name):
                            await self._update_group_in_db(group)
                            groups_updated += 1
                        else:
                            await self._add_group_to_db(group)
                            groups_added += 1
                            
                    except Exception as e:
                        error_msg = f"Error processing group {entry.entry_dn}: {str(e)}"
                        errors.append(error_msg)
                        logger.error(error_msg)
            
            result.success = True
            result.groups_synced = groups_processed
            result.groups_added = groups_added
            result.groups_updated = groups_updated
            result.errors = errors
            
            logger.info(f"Group sync completed: {groups_processed} groups processed")
            
        except Exception as e:
            error_msg = f"Group sync failed: {str(e)}"
            result.errors.append(error_msg)
            logger.error(error_msg)
        
        result.sync_duration = time.time() - start_time
        return result
    
    async def _create_user_from_entry(self, entry) -> LDAPUser:
        """Create LDAPUser from LDAP entry"""
        try:
            # Extract user attributes with safe defaults
            username = str(entry.sAMAccountName) if hasattr(entry, 'sAMAccountName') else ""
            email = str(entry.mail) if hasattr(entry, 'mail') else f"{username}@company.com"
            first_name = str(entry.givenName) if hasattr(entry, 'givenName') else ""
            last_name = str(entry.sn) if hasattr(entry, 'sn') else ""
            display_name = str(entry.displayName) if hasattr(entry, 'displayName') else f"{first_name} {last_name}"
            department = str(entry.department) if hasattr(entry, 'department') else None
            title = str(entry.title) if hasattr(entry, 'title') else None
            phone = str(entry.telephoneNumber) if hasattr(entry, 'telephoneNumber') else None
            manager = str(entry.manager) if hasattr(entry, 'manager') else None
            
            # Get group memberships
            groups = []
            if hasattr(entry, 'memberOf'):
                groups = [str(group) for group in entry.memberOf]
            
            # Determine user status
            status = UserStatus.ACTIVE
            if hasattr(entry, 'userAccountControl'):
                uac = int(entry.userAccountControl)
                if uac & 0x2:  # ACCOUNTDISABLE
                    status = UserStatus.DISABLED
                elif uac & 0x10:  # LOCKOUT
                    status = UserStatus.LOCKED
            
            return LDAPUser(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                display_name=display_name,
                department=department,
                title=title,
                phone=phone,
                manager=manager,
                groups=groups,
                status=status,
                distinguished_name=str(entry.entry_dn)
            )
            
        except Exception as e:
            logger.error(f"Error creating user from LDAP entry: {str(e)}")
            raise
    
    async def _create_group_from_entry(self, entry) -> LDAPGroup:
        """Create LDAPGroup from LDAP entry"""
        try:
            name = str(entry.cn) if hasattr(entry, 'cn') else ""
            display_name = str(entry.displayName) if hasattr(entry, 'displayName') else name
            description = str(entry.description) if hasattr(entry, 'description') else None
            
            # Get group members
            members = []
            if hasattr(entry, 'member'):
                members = [str(member) for member in entry.member]
            
            return LDAPGroup(
                name=name,
                display_name=display_name,
                description=description,
                members=members,
                member_count=len(members),
                distinguished_name=str(entry.entry_dn)
            )
            
        except Exception as e:
            logger.error(f"Error creating group from LDAP entry: {str(e)}")
            raise
    
    def _generate_session_token(self, username: str) -> str:
        """Generate secure session token"""
        timestamp = str(int(time.time()))
        data = f"{username}:{timestamp}:romai_enterprise"
        token = hmac.new(
            key=b"romai_session_secret",
            msg=data.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        return f"{username}:{timestamp}:{token}"
    
    # Database simulation methods (replace with actual database operations)
    async def _user_exists_in_db(self, username: str) -> bool:
        """Check if user exists in local database"""
        # Simulate database check
        return False
    
    async def _add_user_to_db(self, user: LDAPUser) -> None:
        """Add user to local database"""
        # Simulate database insert
        pass
    
    async def _update_user_in_db(self, user: LDAPUser) -> None:
        """Update user in local database"""
        # Simulate database update
        pass
    
    async def _group_exists_in_db(self, group_name: str) -> bool:
        """Check if group exists in local database"""
        # Simulate database check
        return False
    
    async def _add_group_to_db(self, group: LDAPGroup) -> None:
        """Add group to local database"""
        # Simulate database insert
        pass
    
    async def _update_group_in_db(self, group: LDAPGroup) -> None:
        """Update group in local database"""
        # Simulate database update
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform LDAP health check"""
        health_status = {
            "ldap_connection": False,
            "server_reachable": False,
            "authentication_working": False,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "sync_stats": self.sync_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            # Test connection
            if await self.connect():
                health_status["ldap_connection"] = True
                health_status["server_reachable"] = True
                
                # Test search operation
                if self.connection.search(
                    search_base=self.config.base_dn,
                    search_filter="(objectClass=*)",
                    search_scope=SUBTREE,
                    size_limit=1
                ):
                    health_status["authentication_working"] = True
                    
        except Exception as e:
            logger.error(f"LDAP health check failed: {str(e)}")
            health_status["error"] = str(e)
        
        return health_status

# Usage example and configuration
def create_ldap_integration() -> RomAILDAPIntegration:
    """Create LDAP integration instance with default configuration"""
    config = LDAPConfiguration(
        server_uri="ldap://your-domain-controller.company.com",
        base_dn="DC=company,DC=com",
        bind_dn="CN=romai_service,OU=Service Accounts,DC=company,DC=com",
        bind_password="your_service_account_password",
        user_search_base="OU=Users,DC=company,DC=com",
        group_search_base="OU=Groups,DC=company,DC=com",
        auth_method=LDAPAuthMethod.SIMPLE,
        security_level=LDAPSecurityLevel.TLS,
        use_ssl=True,
        validate_certificates=True
    )
    
    return RomAILDAPIntegration(config)

if __name__ == "__main__":
    # Example usage
    async def main():
        ldap = create_ldap_integration()
        
        # Test authentication
        result = await ldap.authenticate_user("john.doe", "password123")
        if result.success:
            print(f"Authentication successful: {result.user.display_name}")
        else:
            print(f"Authentication failed: {result.error_message}")
        
        # Sync users
        sync_result = await ldap.sync_users()
        print(f"User sync: {sync_result.users_synced} users processed")
        
        # Health check
        health = await ldap.health_check()
        print(f"LDAP Health: {health}")
        
        await ldap.disconnect()
    
    asyncio.run(main())
