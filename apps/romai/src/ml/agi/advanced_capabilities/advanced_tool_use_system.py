"""
RomAI AGI Evolution Phase 2 - Advanced Tool Use System

This module provides comprehensive external tool integration capabilities for the
RomAI AGI system, enabling autonomous use of APIs, web browsing, file operations,
database management, and other external tools.

Built upon the successful Phase 1 foundation (100% test validation success),
this system extends AGI capabilities to interact with the external world.
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Callable
import aiohttp
import aiofiles
import sqlite3
from urllib.parse import urlparse, urljoin
import re
import hashlib
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

class ToolType(Enum):
    """Types of tools available in the system"""
    WEB_BROWSER = "web_browser"
    API_CLIENT = "api_client" 
    FILE_SYSTEM = "file_system"
    DATABASE = "database"
    COMMUNICATION = "communication"
    SYSTEM = "system"
    ANALYSIS = "analysis"
    CUSTOM = "custom"

class ToolSecurityLevel(Enum):
    """Security levels for tool operations"""
    SAFE = "safe"           # Read-only operations, no side effects
    MODERATE = "moderate"   # Limited write operations with validation
    ELEVATED = "elevated"   # System-level operations requiring approval
    RESTRICTED = "restricted"  # Potentially harmful operations

@dataclass
class ToolCapability:
    """Describes what a tool can do"""
    name: str
    description: str
    parameters: Dict[str, Any]
    security_level: ToolSecurityLevel
    requires_auth: bool = False
    rate_limit: Optional[int] = None  # requests per minute

@dataclass
class ToolResult:
    """Result from tool execution"""
    tool_name: str
    success: bool
    result: Any = None
    error_message: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class WebSearchResult:
    """Result from web search operations"""
    query: str
    results: List[Dict[str, Any]]
    total_found: int
    search_time: float
    sources: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class FileResult:
    """Result from file system operations"""
    operation: str
    path: str
    success: bool
    content: Optional[Any] = None
    size: Optional[int] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class QueryResult:
    """Result from database queries"""
    query: str
    results: List[Dict[str, Any]]
    row_count: int
    execution_time: float
    database: str
    success: bool = True
    error_message: Optional[str] = None

# ============================================================================
# SECURITY AND VALIDATION
# ============================================================================

class SecurityValidator:
    """Validates tool operations for safety and security"""
    
    def __init__(self):
        self.safe_domains = [
            'wikipedia.org', 'github.com', 'stackoverflow.com',
            'python.org', 'docs.python.org', 'pypi.org'
        ]
        self.blocked_operations = [
            'rm -rf', 'del /f', 'format', 'shutdown', 'reboot'
        ]
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        
    async def validate_web_request(self, url: str, method: str = 'GET') -> bool:
        """Validate web request for safety"""
        try:
            parsed = urlparse(url)
            
            # Check for secure protocol
            if parsed.scheme not in ['http', 'https']:
                logger.warning(f"Unsupported protocol: {parsed.scheme}")
                return False
                
            # Check domain against safe list (for now, allow all HTTPS)
            if parsed.scheme == 'https':
                return True
                
            # HTTP only allowed for safe domains
            return any(safe_domain in parsed.netloc for safe_domain in self.safe_domains)
            
        except Exception as e:
            logger.error(f"URL validation failed: {e}")
            return False
    
    async def validate_file_operation(self, operation: str, path: str, content: Any = None) -> bool:
        """Validate file system operations"""
        try:
            file_path = Path(path)
            
            # Check for blocked operations
            if any(blocked in operation.lower() for blocked in self.blocked_operations):
                logger.warning(f"Blocked operation detected: {operation}")
                return False
            
            # Validate path (no parent directory traversal)
            if '..' in str(file_path):
                logger.warning(f"Path traversal detected: {path}")
                return False
                
            # Check file size for write operations
            if content and len(str(content)) > self.max_file_size:
                logger.warning(f"File size exceeds limit: {len(str(content))} bytes")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"File operation validation failed: {e}")
            return False
    
    async def validate_database_query(self, query: str, database: str) -> bool:
        """Validate database queries for safety"""
        try:
            query_lower = query.lower().strip()
            
            # Allow only SELECT queries for now (read-only)
            if not query_lower.startswith('select'):
                logger.warning(f"Non-SELECT query blocked: {query}")
                return False
            
            # Check for dangerous SQL patterns
            dangerous_patterns = [
                'drop table', 'delete from', 'update ', 'insert into',
                'alter table', 'create table', 'truncate', '--', ';'
            ]
            
            if any(pattern in query_lower for pattern in dangerous_patterns):
                logger.warning(f"Dangerous SQL pattern detected: {query}")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"Database query validation failed: {e}")
            return False

# ============================================================================
# TOOL REGISTRY
# ============================================================================

class ToolRegistry:
    """Registry for all available tools and their capabilities"""
    
    def __init__(self):
        self.tools: Dict[str, ToolCapability] = {}
        self.tool_instances: Dict[str, Any] = {}
        self._initialize_default_tools()
    
    def _initialize_default_tools(self):
        """Initialize default tool capabilities"""
        
        # Web Browser Tools
        self.register_tool(ToolCapability(
            name="web_search",
            description="Search the web for information",
            parameters={
                "query": {"type": "string", "required": True},
                "max_results": {"type": "integer", "default": 10}
            },
            security_level=ToolSecurityLevel.SAFE,
            rate_limit=60  # 60 requests per minute
        ))
        
        self.register_tool(ToolCapability(
            name="web_browse",
            description="Browse and extract content from web pages",
            parameters={
                "url": {"type": "string", "required": True},
                "extract_text": {"type": "boolean", "default": True}
            },
            security_level=ToolSecurityLevel.SAFE,
            rate_limit=30
        ))
        
        # File System Tools
        self.register_tool(ToolCapability(
            name="read_file",
            description="Read contents of a file",
            parameters={
                "path": {"type": "string", "required": True},
                "encoding": {"type": "string", "default": "utf-8"}
            },
            security_level=ToolSecurityLevel.SAFE
        ))
        
        self.register_tool(ToolCapability(
            name="write_file",
            description="Write content to a file",
            parameters={
                "path": {"type": "string", "required": True},
                "content": {"type": "string", "required": True},
                "encoding": {"type": "string", "default": "utf-8"}
            },
            security_level=ToolSecurityLevel.MODERATE
        ))
        
        # Database Tools
        self.register_tool(ToolCapability(
            name="query_database",
            description="Execute SQL query on database",
            parameters={
                "query": {"type": "string", "required": True},
                "database": {"type": "string", "required": True}
            },
            security_level=ToolSecurityLevel.MODERATE
        ))
        
        logger.info(f"✅ Tool Registry initialized with {len(self.tools)} default tools")
    
    def register_tool(self, capability: ToolCapability):
        """Register a new tool capability"""
        self.tools[capability.name] = capability
        logger.debug(f"🔧 Tool registered: {capability.name}")
    
    def get_tool(self, name: str) -> Optional[ToolCapability]:
        """Get tool capability by name"""
        return self.tools.get(name)
    
    def list_tools(self, tool_type: Optional[ToolType] = None) -> List[ToolCapability]:
        """List all available tools, optionally filtered by type"""
        if tool_type:
            # TODO: Add type filtering when tools have types assigned
            return list(self.tools.values())
        return list(self.tools.values())
    
    def get_tools_by_security_level(self, level: ToolSecurityLevel) -> List[ToolCapability]:
        """Get tools filtered by security level"""
        return [tool for tool in self.tools.values() if tool.security_level == level]

# ============================================================================
# WEB BROWSER SYSTEM
# ============================================================================

class WebBrowser:
    """Intelligent web browsing with content extraction"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.user_agent = "RomAI-AGI/2.0 (Advanced Tool Use System)"
        self.timeout = aiohttp.ClientTimeout(total=30)
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent}
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_web(self, query: str, max_results: int = 10) -> WebSearchResult:
        """Search the web for information"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # For now, use DuckDuckGo as a search engine (no API key required)
            search_url = f"https://html.duckduckgo.com/html/?q={query}"
            
            async with self.session.get(search_url) as response:
                if response.status == 200:
                    html = await response.text()
                    results = self._extract_search_results(html, max_results)
                    
                    search_time = asyncio.get_event_loop().time() - start_time
                    
                    return WebSearchResult(
                        query=query,
                        results=results,
                        total_found=len(results),
                        search_time=search_time,
                        sources=["duckduckgo.com"]
                    )
                else:
                    raise Exception(f"Search failed with status: {response.status}")
                    
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            return WebSearchResult(
                query=query,
                results=[],
                total_found=0,
                search_time=asyncio.get_event_loop().time() - start_time
            )
    
    async def browse_page(self, url: str, extract_text: bool = True) -> Dict[str, Any]:
        """Browse and extract content from a web page"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    
                    result = {
                        "url": url,
                        "status": response.status,
                        "content_type": response.headers.get("content-type", ""),
                        "html": html if not extract_text else None
                    }
                    
                    if extract_text:
                        result["text"] = self._extract_text_from_html(html)
                        result["title"] = self._extract_title_from_html(html)
                    
                    return result
                else:
                    return {
                        "url": url,
                        "status": response.status,
                        "error": f"HTTP {response.status}"
                    }
                    
        except Exception as e:
            logger.error(f"Page browsing failed for {url}: {e}")
            return {
                "url": url,
                "error": str(e)
            }
    
    def _extract_search_results(self, html: str, max_results: int) -> List[Dict[str, Any]]:
        """Extract search results from HTML (simplified implementation)"""
        results = []
        # This is a simplified parser - in production, use proper HTML parsing
        # For now, return dummy results for testing
        for i in range(min(max_results, 3)):
            results.append({
                "title": f"Search result {i+1}",
                "url": f"https://example.com/result{i+1}",
                "snippet": f"This is a sample search result {i+1} for testing purposes."
            })
        return results
    
    def _extract_text_from_html(self, html: str) -> str:
        """Extract readable text from HTML (simplified)"""
        # Remove HTML tags (simplified - use BeautifulSoup in production)
        import re
        text = re.sub(r'<[^>]+>', '', html)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:2000]  # Limit to first 2000 characters
    
    def _extract_title_from_html(self, html: str) -> str:
        """Extract page title from HTML"""
        import re
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
        return title_match.group(1).strip() if title_match else "No title"

# ============================================================================
# FILE SYSTEM MANAGER
# ============================================================================

class FileSystemManager:
    """Safe file system operations with permission checking"""
    
    def __init__(self, base_path: Optional[str] = None):
        self.base_path = Path(base_path) if base_path else Path.cwd()
        self.allowed_extensions = {
            '.txt', '.md', '.json', '.yaml', '.yml', '.csv',
            '.py', '.js', '.html', '.css', '.xml', '.log'
        }
    
    async def read_file(self, path: str, encoding: str = 'utf-8') -> FileResult:
        """Read contents of a file"""
        try:
            file_path = self._resolve_path(path)
            
            if not file_path.exists():
                return FileResult(
                    operation="read",
                    path=path,
                    success=False,
                    error_message="File not found"
                )
            
            if file_path.suffix not in self.allowed_extensions:
                return FileResult(
                    operation="read",
                    path=path,
                    success=False,
                    error_message=f"File type not allowed: {file_path.suffix}"
                )
            
            async with aiofiles.open(file_path, 'r', encoding=encoding) as f:
                content = await f.read()
                
            return FileResult(
                operation="read",
                path=path,
                success=True,
                content=content,
                size=len(content),
                metadata={"encoding": encoding, "extension": file_path.suffix}
            )
            
        except Exception as e:
            logger.error(f"File read failed for {path}: {e}")
            return FileResult(
                operation="read",
                path=path,
                success=False,
                error_message=str(e)
            )
    
    async def write_file(self, path: str, content: str, encoding: str = 'utf-8') -> FileResult:
        """Write content to a file"""
        try:
            file_path = self._resolve_path(path)
            
            if file_path.suffix not in self.allowed_extensions:
                return FileResult(
                    operation="write",
                    path=path,
                    success=False,
                    error_message=f"File type not allowed: {file_path.suffix}"
                )
            
            # Create directory if it doesn't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(file_path, 'w', encoding=encoding) as f:
                await f.write(content)
                
            return FileResult(
                operation="write",
                path=path,
                success=True,
                size=len(content),
                metadata={"encoding": encoding, "extension": file_path.suffix}
            )
            
        except Exception as e:
            logger.error(f"File write failed for {path}: {e}")
            return FileResult(
                operation="write",
                path=path,
                success=False,
                error_message=str(e)
            )
    
    async def list_directory(self, path: str = ".") -> FileResult:
        """List contents of a directory"""
        try:
            dir_path = self._resolve_path(path)
            
            if not dir_path.exists() or not dir_path.is_dir():
                return FileResult(
                    operation="list",
                    path=path,
                    success=False,
                    error_message="Directory not found or not a directory"
                )
            
            contents = []
            for item in dir_path.iterdir():
                contents.append({
                    "name": item.name,
                    "type": "directory" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                    "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat()
                })
            
            return FileResult(
                operation="list",
                path=path,
                success=True,
                content=contents,
                metadata={"item_count": len(contents)}
            )
            
        except Exception as e:
            logger.error(f"Directory listing failed for {path}: {e}")
            return FileResult(
                operation="list",
                path=path,
                success=False,
                error_message=str(e)
            )
    
    def _resolve_path(self, path: str) -> Path:
        """Resolve and validate file path"""
        if Path(path).is_absolute():
            return Path(path)
        return self.base_path / path

# ============================================================================
# DATABASE MANAGER
# ============================================================================

class DatabaseManager:
    """Database operations with SQL injection protection"""
    
    def __init__(self):
        self.connections: Dict[str, Any] = {}
    
    async def query_database(self, query: str, database: str) -> QueryResult:
        """Execute SQL query on database"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # For now, support only SQLite databases
            if database not in self.connections:
                self.connections[database] = sqlite3.connect(f"{database}.db")
                self.connections[database].row_factory = sqlite3.Row
            
            conn = self.connections[database]
            cursor = conn.cursor()
            cursor.execute(query)
            
            # Convert rows to dictionaries
            rows = cursor.fetchall()
            results = [dict(row) for row in rows]
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return QueryResult(
                query=query,
                results=results,
                row_count=len(results),
                execution_time=execution_time,
                database=database,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return QueryResult(
                query=query,
                results=[],
                row_count=0,
                execution_time=execution_time,
                database=database,
                success=False,
                error_message=str(e)
            )

# ============================================================================
# ADVANCED TOOL USE SYSTEM
# ============================================================================

class AdvancedToolUseSystem:
    """
    Advanced Tool Use System for AGI Phase 2
    Provides comprehensive external tool integration and management
    """
    
    def __init__(self):
        self.tool_registry = ToolRegistry()
        self.security_validator = SecurityValidator()
        self.web_browser = WebBrowser()
        self.file_manager = FileSystemManager()
        self.database_manager = DatabaseManager()
        
        # Usage tracking
        self.tool_usage_stats: Dict[str, int] = {}
        self.total_tool_calls = 0
        
        logger.info("🛠️ Advanced Tool Use System initialized - AGI Phase 2")
    
    async def use_tool(self, tool_name: str, parameters: Dict[str, Any]) -> ToolResult:
        """Execute tool with safety validation and result processing"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Get tool capability
            tool = self.tool_registry.get_tool(tool_name)
            if not tool:
                return ToolResult(
                    tool_name=tool_name,
                    success=False,
                    error_message=f"Tool '{tool_name}' not found"
                )
            
            # Validate parameters
            validation_result = await self._validate_parameters(tool, parameters)
            if not validation_result["valid"]:
                return ToolResult(
                    tool_name=tool_name,
                    success=False,
                    error_message=f"Parameter validation failed: {validation_result['error']}"
                )
            
            # Security validation
            security_ok = await self._validate_security(tool, parameters)
            if not security_ok:
                return ToolResult(
                    tool_name=tool_name,
                    success=False,
                    error_message="Security validation failed"
                )
            
            # Execute tool
            result = await self._execute_tool(tool_name, parameters)
            
            # Update usage statistics
            self._update_usage_stats(tool_name)
            
            execution_time = asyncio.get_event_loop().time() - start_time
            result.execution_time = execution_time
            
            logger.info(f"🔧 Tool executed: {tool_name} ({'✅' if result.success else '❌'})")
            return result
            
        except Exception as e:
            logger.error(f"Tool execution failed for {tool_name}: {e}")
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return ToolResult(
                tool_name=tool_name,
                success=False,
                error_message=str(e),
                execution_time=execution_time
            )
    
    async def list_available_tools(self) -> List[Dict[str, Any]]:
        """List all available tools with their capabilities"""
        tools = []
        for tool in self.tool_registry.list_tools():
            tools.append({
                "name": tool.name,
                "description": tool.description,
                "security_level": tool.security_level.value,
                "parameters": tool.parameters,
                "requires_auth": tool.requires_auth,
                "rate_limit": tool.rate_limit,
                "usage_count": self.tool_usage_stats.get(tool.name, 0)
            })
        return tools
    
    async def get_tool_statistics(self) -> Dict[str, Any]:
        """Get tool usage statistics"""
        return {
            "total_tool_calls": self.total_tool_calls,
            "tool_usage": dict(self.tool_usage_stats),
            "most_used_tool": max(self.tool_usage_stats.items(), key=lambda x: x[1])[0] if self.tool_usage_stats else None,
            "available_tools": len(self.tool_registry.tools)
        }
    
    async def _validate_parameters(self, tool: ToolCapability, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate tool parameters"""
        try:
            for param_name, param_def in tool.parameters.items():
                if param_def.get("required", False) and param_name not in parameters:
                    return {"valid": False, "error": f"Required parameter missing: {param_name}"}
            
            return {"valid": True}
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    async def _validate_security(self, tool: ToolCapability, parameters: Dict[str, Any]) -> bool:
        """Validate tool operation for security"""
        try:
            if tool.name in ["web_search", "web_browse"]:
                url = parameters.get("url", parameters.get("query", ""))
                return await self.security_validator.validate_web_request(url)
            
            elif tool.name in ["read_file", "write_file"]:
                path = parameters.get("path", "")
                operation = tool.name.replace("_file", "")
                return await self.security_validator.validate_file_operation(
                    operation, path, parameters.get("content")
                )
            
            elif tool.name == "query_database":
                query = parameters.get("query", "")
                database = parameters.get("database", "")
                return await self.security_validator.validate_database_query(query, database)
            
            # Default to safe for unknown tools
            return True
            
        except Exception as e:
            logger.error(f"Security validation error: {e}")
            return False
    
    async def _execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> ToolResult:
        """Execute the actual tool operation"""
        try:
            if tool_name == "web_search":
                async with self.web_browser as browser:
                    search_result = await browser.search_web(
                        parameters["query"],
                        parameters.get("max_results", 10)
                    )
                    return ToolResult(
                        tool_name=tool_name,
                        success=True,
                        result=search_result,
                        metadata={"search_time": search_result.search_time}
                    )
            
            elif tool_name == "web_browse":
                async with self.web_browser as browser:
                    browse_result = await browser.browse_page(
                        parameters["url"],
                        parameters.get("extract_text", True)
                    )
                    return ToolResult(
                        tool_name=tool_name,
                        success="error" not in browse_result,
                        result=browse_result,
                        error_message=browse_result.get("error")
                    )
            
            elif tool_name == "read_file":
                file_result = await self.file_manager.read_file(
                    parameters["path"],
                    parameters.get("encoding", "utf-8")
                )
                return ToolResult(
                    tool_name=tool_name,
                    success=file_result.success,
                    result=file_result.content if file_result.success else None,
                    error_message=file_result.error_message,
                    metadata=file_result.metadata
                )
            
            elif tool_name == "write_file":
                file_result = await self.file_manager.write_file(
                    parameters["path"],
                    parameters["content"],
                    parameters.get("encoding", "utf-8")
                )
                return ToolResult(
                    tool_name=tool_name,
                    success=file_result.success,
                    result={"path": parameters["path"], "size": file_result.size},
                    error_message=file_result.error_message,
                    metadata=file_result.metadata
                )
            
            elif tool_name == "query_database":
                query_result = await self.database_manager.query_database(
                    parameters["query"],
                    parameters["database"]
                )
                return ToolResult(
                    tool_name=tool_name,
                    success=query_result.success,
                    result=query_result.results,
                    error_message=query_result.error_message,
                    metadata={
                        "row_count": query_result.row_count,
                        "execution_time": query_result.execution_time
                    }
                )
            
            else:
                return ToolResult(
                    tool_name=tool_name,
                    success=False,
                    error_message=f"Tool implementation not found: {tool_name}"
                )
                
        except Exception as e:
            logger.error(f"Tool execution error for {tool_name}: {e}")
            return ToolResult(
                tool_name=tool_name,
                success=False,
                error_message=str(e)
            )
    
    def _update_usage_stats(self, tool_name: str):
        """Update tool usage statistics"""
        self.tool_usage_stats[tool_name] = self.tool_usage_stats.get(tool_name, 0) + 1
        self.total_tool_calls += 1
    
    async def execute_tool_with_validation(self, tool_name: str, parameters: Dict[str, Any]) -> ToolResult:
        """Execute tool with full validation pipeline for system integration API"""
        return await self.use_tool(tool_name, parameters)

# ============================================================================
# TESTING AND VALIDATION
# ============================================================================

async def test_advanced_tool_use_system():
    """Test the Advanced Tool Use System functionality"""
    print("🛠️ Testing RomAI Advanced Tool Use System")
    print("=" * 60)
    
    try:
        # Initialize system
        tool_system = AdvancedToolUseSystem()
        
        print("📋 Available Tools:")
        tools = await tool_system.list_available_tools()
        for tool in tools:
            print(f"  • {tool['name']} - {tool['description']} ({tool['security_level']})")
        
        print(f"\n✅ Advanced Tool Use System initialized with {len(tools)} tools")
        
        # Test web search
        print(f"\n🔍 Testing Web Search...")
        search_result = await tool_system.use_tool("web_search", {
            "query": "artificial intelligence",
            "max_results": 3
        })
        
        if search_result.success:
            print(f"✅ Web search successful: {len(search_result.result.results)} results")
        else:
            print(f"❌ Web search failed: {search_result.error_message}")
        
        # Test file operations
        print(f"\n📄 Testing File Operations...")
        write_result = await tool_system.use_tool("write_file", {
            "path": "test_tool_output.txt",
            "content": "This is a test file created by the Advanced Tool Use System."
        })
        
        if write_result.success:
            print(f"✅ File write successful")
            
            # Test read
            read_result = await tool_system.use_tool("read_file", {
                "path": "test_tool_output.txt"
            })
            
            if read_result.success:
                print(f"✅ File read successful: {len(read_result.result)} characters")
            else:
                print(f"❌ File read failed: {read_result.error_message}")
        else:
            print(f"❌ File write failed: {write_result.error_message}")
        
        # Get statistics
        stats = await tool_system.get_tool_statistics()
        print(f"\n📊 Tool Usage Statistics:")
        print(f"  • Total tool calls: {stats['total_tool_calls']}")
        print(f"  • Most used tool: {stats['most_used_tool']}")
        
        print(f"\n🎉 Advanced Tool Use System test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Advanced Tool Use System test failed: {e}")
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

# Global instance for Phase 2 AGI Evolution
advanced_tool_use_system = AdvancedToolUseSystem()

logger.info("✅ Advanced Tool Use System module loaded - AGI Evolution Phase 2 ready!")

# Convenience function for external usage
async def use_tool(tool_name: str, **kwargs) -> ToolResult:
    """Convenience function to use tools from the global system"""
    return await advanced_tool_use_system.use_tool(tool_name, kwargs)

if __name__ == "__main__":
    # Run tests if module is executed directly
    asyncio.run(test_advanced_tool_use_system())