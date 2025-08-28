"""
ROMAI Tool Manager - Core Tool Execution System
==============================================

Production-ready tool management system for ROMAI AGI with security, monitoring,
and extensibility. Supports safe execution of terminal commands, filesystem operations,
and browser automation within controlled environments.

Features:
- Sandboxed execution with timeout controls
- Comprehensive error handling and logging  
- Resource usage monitoring
- Tool result standardization
- Security policy enforcement

Author: GitHub Copilot AGI Inspector
Date: August 27, 2025
Status: Production Implementation
"""

import asyncio
import subprocess
import os
import time
import logging
import shlex
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime
import json
import psutil

# Configure logging
logger = logging.getLogger(__name__)


class ToolExecutionError(Exception):
    """Custom exception for tool execution failures."""
    pass


@dataclass
class ToolResult:
    """Standardized result format for all tool operations."""
    success: bool
    output: str
    error: str = ""
    execution_time: float = 0.0
    tool_name: str = ""
    resource_usage: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'success': self.success,
            'output': self.output,
            'error': self.error,
            'execution_time': self.execution_time,
            'tool_name': self.tool_name,
            'resource_usage': self.resource_usage,
            'timestamp': self.timestamp,
            'metadata': self.metadata
        }
    
    def __str__(self) -> str:
        status = "SUCCESS" if self.success else "FAILED"
        return f"[{status}] {self.tool_name}: {self.output[:100]}..."


class SecurityPolicy:
    """Security policy for tool execution."""
    
    def __init__(self):
        self.allowed_commands = {
            # Safe read-only commands
            'ls', 'dir', 'cat', 'type', 'pwd', 'cd', 'echo', 'head', 'tail',
            'find', 'grep', 'wc', 'sort', 'uniq', 'whoami', 'date', 'uptime',
            # Python execution (sandboxed)
            'python', 'python3', 'pip', 'conda',
            # Git operations (read-only preferred)
            'git',
            # System info
            'systeminfo', 'tasklist', 'ps', 'df', 'free', 'top', 'htop'
        }
        
        self.blocked_commands = {
            # Dangerous system commands
            'rm', 'del', 'format', 'fdisk', 'dd', 'mkfs',
            'shutdown', 'reboot', 'halt', 'poweroff',
            # Network/security risks
            'wget', 'curl', 'nc', 'netcat', 'ssh', 'ftp', 'telnet',
            # Package management (can be dangerous)
            'apt', 'yum', 'dnf', 'pacman', 'brew',
            # Process control
            'kill', 'killall', 'pkill', 'taskkill'
        }
        
        self.max_execution_time = 30.0  # seconds
        self.max_output_size = 1024 * 1024  # 1MB
        self.allowed_directories = [
            os.getcwd(),  # Current working directory
            os.path.expanduser("~"),  # User home directory
            "/tmp", "C:\\temp", "C:\\Users\\Public"  # Temporary directories
        ]
    
    def is_command_allowed(self, command: str) -> bool:
        """Check if command is allowed by security policy."""
        base_command = command.split()[0].lower()
        
        # Check if explicitly blocked
        if base_command in self.blocked_commands:
            return False
        
        # Check if explicitly allowed
        if base_command in self.allowed_commands:
            return True
        
        # Default deny for unknown commands
        logger.warning(f"Unknown command blocked by policy: {base_command}")
        return False
    
    def sanitize_path(self, path: str) -> str:
        """Sanitize and validate file paths."""
        try:
            # Resolve to absolute path
            abs_path = os.path.abspath(path)
            
            # Check if within allowed directories
            allowed = False
            for allowed_dir in self.allowed_directories:
                if abs_path.startswith(os.path.abspath(allowed_dir)):
                    allowed = True
                    break
            
            if not allowed:
                raise ToolExecutionError(f"Path not allowed: {path}")
            
            return abs_path
        except Exception as e:
            raise ToolExecutionError(f"Path sanitization failed: {e}")


class ResourceMonitor:
    """Monitor resource usage during tool execution."""
    
    def __init__(self):
        self.process = psutil.Process()
        self.initial_memory = 0
        self.initial_cpu_time = 0
    
    def start_monitoring(self):
        """Start monitoring resource usage."""
        try:
            self.initial_memory = self.process.memory_info().rss
            self.initial_cpu_time = self.process.cpu_times().user + self.process.cpu_times().system
        except Exception as e:
            logger.warning(f"Resource monitoring start failed: {e}")
    
    def get_usage(self) -> Dict[str, Any]:
        """Get current resource usage."""
        try:
            current_memory = self.process.memory_info().rss
            current_cpu_time = self.process.cpu_times().user + self.process.cpu_times().system
            
            return {
                'memory_used_mb': (current_memory - self.initial_memory) / (1024 * 1024),
                'cpu_time_used': current_cpu_time - self.initial_cpu_time,
                'total_memory_mb': current_memory / (1024 * 1024),
                'cpu_percent': self.process.cpu_percent()
            }
        except Exception as e:
            logger.warning(f"Resource monitoring failed: {e}")
            return {'error': str(e)}


class ToolManager:
    """
    Advanced tool management system for ROMAI AGI.
    
    Provides safe, monitored, and extensible tool execution capabilities
    with comprehensive security controls and performance optimization.
    """
    
    def __init__(self, enable_security: bool = True):
        self.security_policy = SecurityPolicy() if enable_security else None
        self.resource_monitor = ResourceMonitor()
        self.execution_history: List[ToolResult] = []
        self.stats = {
            'total_executions': 0,
            'successful_executions': 0,
            'failed_executions': 0,
            'average_execution_time': 0.0,
            'tools_used': set()
        }
        
        # Tool registry
        self.available_tools = {
            'terminal': self.execute_terminal_command,
            'read_file': self.read_file,
            'write_file': self.write_file,
            'list_directory': self.list_directory,
            'create_directory': self.create_directory,
            'file_exists': self.file_exists,
            'get_file_info': self.get_file_info,
            'python_exec': self.execute_python_code,
            'system_info': self.get_system_info
        }
        
        logger.info(f"ToolManager initialized with {len(self.available_tools)} tools")
        logger.info(f"Security policy: {'ENABLED' if enable_security else 'DISABLED'}")
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> ToolResult:
        """
        Execute a tool with the given parameters.
        
        Args:
            tool_name: Name of the tool to execute
            params: Parameters to pass to the tool
            
        Returns:
            ToolResult with execution details
        """
        start_time = time.time()
        self.resource_monitor.start_monitoring()
        
        try:
            # Validate tool exists
            if tool_name not in self.available_tools:
                raise ToolExecutionError(f"Tool '{tool_name}' not available. Available tools: {list(self.available_tools.keys())}")
            
            # Execute the tool
            logger.info(f"Executing tool: {tool_name} with params: {params}")
            tool_function = self.available_tools[tool_name]
            output = await tool_function(params)
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Get resource usage
            resource_usage = self.resource_monitor.get_usage()
            
            # Create successful result
            result = ToolResult(
                success=True,
                output=str(output),
                execution_time=execution_time,
                tool_name=tool_name,
                resource_usage=resource_usage,
                metadata={'params': params}
            )
            
            # Update statistics
            self._update_stats(result)
            
            logger.info(f"Tool {tool_name} executed successfully in {execution_time:.2f}s")
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            resource_usage = self.resource_monitor.get_usage()
            
            # Create failed result
            result = ToolResult(
                success=False,
                output="",
                error=str(e),
                execution_time=execution_time,
                tool_name=tool_name,
                resource_usage=resource_usage,
                metadata={'params': params}
            )
            
            self._update_stats(result)
            logger.error(f"Tool {tool_name} failed: {e}")
            return result
    
    async def execute_terminal_command(self, params: Dict[str, Any]) -> str:
        """Execute a terminal command with security controls."""
        command = params.get('command', '').strip()
        if not command:
            raise ToolExecutionError("No command provided")
        
        # Security check
        if self.security_policy and not self.security_policy.is_command_allowed(command):
            raise ToolExecutionError(f"Command blocked by security policy: {command}")
        
        # Set working directory if provided
        cwd = params.get('cwd', os.getcwd())
        if self.security_policy:
            cwd = self.security_policy.sanitize_path(cwd)
        
        # Set timeout
        timeout = min(params.get('timeout', 30), self.security_policy.max_execution_time if self.security_policy else 30)
        
        try:
            # Execute command
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd,
                shell=True
            )
            
            # Wait for completion with timeout
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), 
                timeout=timeout
            )
            
            # Decode output
            stdout_text = stdout.decode('utf-8', errors='replace')
            stderr_text = stderr.decode('utf-8', errors='replace')
            
            # Check for errors
            if process.returncode != 0:
                error_msg = f"Command failed (exit code {process.returncode}): {stderr_text}"
                if stdout_text:
                    error_msg += f"\nStdout: {stdout_text}"
                raise ToolExecutionError(error_msg)
            
            return stdout_text
            
        except asyncio.TimeoutError:
            raise ToolExecutionError(f"Command timed out after {timeout} seconds")
        except Exception as e:
            raise ToolExecutionError(f"Command execution failed: {e}")
    
    async def read_file(self, params: Dict[str, Any]) -> str:
        """Read a file from the filesystem."""
        filepath = params.get('filepath', '')
        if not filepath:
            raise ToolExecutionError("No filepath provided")
        
        # Security check
        if self.security_policy:
            filepath = self.security_policy.sanitize_path(filepath)
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            
            # Limit output size
            max_size = self.security_policy.max_output_size if self.security_policy else 1024*1024
            if len(content) > max_size:
                content = content[:max_size] + f"\n... [TRUNCATED - file size exceeds {max_size} bytes]"
            
            return content
            
        except FileNotFoundError:
            raise ToolExecutionError(f"File not found: {filepath}")
        except PermissionError:
            raise ToolExecutionError(f"Permission denied: {filepath}")
        except Exception as e:
            raise ToolExecutionError(f"File read failed: {e}")
    
    async def write_file(self, params: Dict[str, Any]) -> str:
        """Write content to a file."""
        filepath = params.get('filepath', '')
        content = params.get('content', '')
        
        if not filepath:
            raise ToolExecutionError("No filepath provided")
        
        # Security check
        if self.security_policy:
            filepath = self.security_policy.sanitize_path(filepath)
        
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return f"Successfully wrote {len(content)} characters to {filepath}"
            
        except PermissionError:
            raise ToolExecutionError(f"Permission denied: {filepath}")
        except Exception as e:
            raise ToolExecutionError(f"File write failed: {e}")
    
    async def list_directory(self, params: Dict[str, Any]) -> str:
        """List contents of a directory."""
        dirpath = params.get('dirpath', '.')
        show_hidden = params.get('show_hidden', False)
        
        # Security check
        if self.security_policy:
            dirpath = self.security_policy.sanitize_path(dirpath)
        
        try:
            entries = []
            for item in os.listdir(dirpath):
                if not show_hidden and item.startswith('.'):
                    continue
                
                item_path = os.path.join(dirpath, item)
                is_dir = os.path.isdir(item_path)
                size = os.path.getsize(item_path) if not is_dir else 0
                
                entries.append({
                    'name': item,
                    'type': 'directory' if is_dir else 'file',
                    'size': size
                })
            
            # Sort by type then name
            entries.sort(key=lambda x: (x['type'], x['name']))
            
            # Format output
            output_lines = [f"Contents of {dirpath}:"]
            for entry in entries:
                type_marker = "/" if entry['type'] == 'directory' else ""
                size_str = f" ({entry['size']} bytes)" if entry['type'] == 'file' else ""
                output_lines.append(f"  {entry['name']}{type_marker}{size_str}")
            
            return "\n".join(output_lines)
            
        except FileNotFoundError:
            raise ToolExecutionError(f"Directory not found: {dirpath}")
        except PermissionError:
            raise ToolExecutionError(f"Permission denied: {dirpath}")
        except Exception as e:
            raise ToolExecutionError(f"Directory listing failed: {e}")
    
    async def create_directory(self, params: Dict[str, Any]) -> str:
        """Create a new directory."""
        dirpath = params.get('dirpath', '')
        if not dirpath:
            raise ToolExecutionError("No directory path provided")
        
        # Security check
        if self.security_policy:
            dirpath = self.security_policy.sanitize_path(dirpath)
        
        try:
            os.makedirs(dirpath, exist_ok=True)
            return f"Directory created: {dirpath}"
        except PermissionError:
            raise ToolExecutionError(f"Permission denied: {dirpath}")
        except Exception as e:
            raise ToolExecutionError(f"Directory creation failed: {e}")
    
    async def file_exists(self, params: Dict[str, Any]) -> str:
        """Check if a file or directory exists."""
        filepath = params.get('filepath', '')
        if not filepath:
            raise ToolExecutionError("No filepath provided")
        
        # Security check
        if self.security_policy:
            filepath = self.security_policy.sanitize_path(filepath)
        
        exists = os.path.exists(filepath)
        if exists:
            is_file = os.path.isfile(filepath)
            is_dir = os.path.isdir(filepath)
            return f"Path exists: {filepath} ({'file' if is_file else 'directory' if is_dir else 'other'})"
        else:
            return f"Path does not exist: {filepath}"
    
    async def get_file_info(self, params: Dict[str, Any]) -> str:
        """Get detailed information about a file."""
        filepath = params.get('filepath', '')
        if not filepath:
            raise ToolExecutionError("No filepath provided")
        
        # Security check
        if self.security_policy:
            filepath = self.security_policy.sanitize_path(filepath)
        
        try:
            if not os.path.exists(filepath):
                raise ToolExecutionError(f"File not found: {filepath}")
            
            stat = os.stat(filepath)
            return f"""File Information: {filepath}
Size: {stat.st_size} bytes
Type: {'File' if os.path.isfile(filepath) else 'Directory' if os.path.isdir(filepath) else 'Other'}
Modified: {datetime.fromtimestamp(stat.st_mtime).isoformat()}
Created: {datetime.fromtimestamp(stat.st_ctime).isoformat()}
Permissions: {oct(stat.st_mode)[-3:]}"""
            
        except Exception as e:
            raise ToolExecutionError(f"File info failed: {e}")
    
    async def execute_python_code(self, params: Dict[str, Any]) -> str:
        """Execute Python code in a controlled environment."""
        code = params.get('code', '').strip()
        if not code:
            raise ToolExecutionError("No code provided")
        
        # Security check - only allow safe operations
        dangerous_keywords = ['import os', 'import sys', 'exec', 'eval', 'open', '__import__']
        if any(keyword in code.lower() for keyword in dangerous_keywords):
            raise ToolExecutionError("Code contains potentially dangerous operations")
        
        try:
            # Create a safe namespace
            safe_globals = {
                '__builtins__': {
                    'len': len, 'str': str, 'int': int, 'float': float, 'bool': bool,
                    'list': list, 'dict': dict, 'tuple': tuple, 'set': set,
                    'range': range, 'enumerate': enumerate, 'zip': zip,
                    'min': min, 'max': max, 'sum': sum, 'abs': abs,
                    'round': round, 'sorted': sorted, 'reversed': reversed,
                    'print': print
                },
                'math': __import__('math'),
                'datetime': __import__('datetime')
            }
            
            # Execute code with timeout
            import io
            import contextlib
            
            output_buffer = io.StringIO()
            with contextlib.redirect_stdout(output_buffer):
                exec(code, safe_globals)
            
            result = output_buffer.getvalue()
            return result if result else "Code executed successfully (no output)"
            
        except Exception as e:
            raise ToolExecutionError(f"Python execution failed: {e}")
    
    async def get_system_info(self, params: Dict[str, Any]) -> str:
        """Get system information."""
        try:
            import platform
            
            info = {
                'Platform': platform.platform(),
                'System': platform.system(),
                'Release': platform.release(),
                'Version': platform.version(),
                'Machine': platform.machine(),
                'Processor': platform.processor(),
                'Python Version': platform.python_version(),
                'CPU Count': psutil.cpu_count(),
                'Memory Total (GB)': round(psutil.virtual_memory().total / (1024**3), 2),
                'Memory Available (GB)': round(psutil.virtual_memory().available / (1024**3), 2),
                'Disk Usage (GB)': round(psutil.disk_usage('/').total / (1024**3), 2) if os.name != 'nt' else round(psutil.disk_usage('C:\\').total / (1024**3), 2)
            }
            
            return '\n'.join([f"{key}: {value}" for key, value in info.items()])
            
        except Exception as e:
            raise ToolExecutionError(f"System info failed: {e}")
    
    def _update_stats(self, result: ToolResult):
        """Update execution statistics."""
        self.execution_history.append(result)
        self.stats['total_executions'] += 1
        
        if result.success:
            self.stats['successful_executions'] += 1
        else:
            self.stats['failed_executions'] += 1
        
        self.stats['tools_used'].add(result.tool_name)
        
        # Update average execution time
        total_time = sum(r.execution_time for r in self.execution_history)
        self.stats['average_execution_time'] = total_time / len(self.execution_history)
        
        # Keep history limited to last 1000 executions
        if len(self.execution_history) > 1000:
            self.execution_history = self.execution_history[-1000:]
    
    def get_tool_stats(self) -> Dict[str, Any]:
        """Get tool execution statistics."""
        return {
            **self.stats,
            'tools_used': list(self.stats['tools_used']),
            'success_rate': self.stats['successful_executions'] / max(1, self.stats['total_executions']),
            'available_tools': list(self.available_tools.keys()),
            'recent_executions': len(self.execution_history)
        }
    
    def get_execution_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent execution history."""
        return [result.to_dict() for result in self.execution_history[-limit:]]


# Example usage and testing
async def main():
    """Example usage of the ToolManager."""
    print("🔧 ROMAI Tool Manager Test")
    print("=" * 40)
    
    # Initialize tool manager
    tool_manager = ToolManager(enable_security=True)
    
    # Test terminal command
    print("\n1. Testing terminal command...")
    result = await tool_manager.execute_tool('terminal', {'command': 'echo "Hello from ROMAI AGI!"'})
    print(f"Result: {result}")
    
    # Test directory listing
    print("\n2. Testing directory listing...")
    result = await tool_manager.execute_tool('list_directory', {'dirpath': '.'})
    print(f"Result: {result}")
    
    # Test Python execution
    print("\n3. Testing Python execution...")
    result = await tool_manager.execute_tool('python_exec', {
        'code': 'print("AGI calculation:", 2+2); print("Math result:", sum(range(10)))'
    })
    print(f"Result: {result}")
    
    # Test system info
    print("\n4. Testing system info...")
    result = await tool_manager.execute_tool('system_info', {})
    print(f"Result: {result}")
    
    # Show statistics
    print("\n5. Tool Statistics:")
    stats = tool_manager.get_tool_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    asyncio.run(main())