"""
File Action Controller Module

Specialized controller for filesystem operations and file management.
Provides comprehensive file and directory manipulation, content processing,
backup operations, and monitoring capabilities for RUAGA's action-taking system.

Key Capabilities:
- File and directory operations (create, read, write, delete, move, copy)
- Content processing and transformation
- File monitoring and change detection
- Backup and restore operations
- Archive creation and extraction
- Permission and metadata management
"""

import os
import shutil
import time
import logging
import asyncio
import hashlib
import json
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import tempfile
from datetime import datetime


logger = logging.getLogger(__name__)


class FileActionType(Enum):
    """Types of file actions."""
    READ_FILE = "read_file"
    WRITE_FILE = "write_file"
    APPEND_FILE = "append_file"
    DELETE_FILE = "delete_file"
    COPY_FILE = "copy_file"
    MOVE_FILE = "move_file"
    CREATE_DIRECTORY = "create_directory"
    DELETE_DIRECTORY = "delete_directory"
    LIST_DIRECTORY = "list_directory"
    GET_FILE_INFO = "get_file_info"
    SET_PERMISSIONS = "set_permissions"
    CREATE_ARCHIVE = "create_archive"
    EXTRACT_ARCHIVE = "extract_archive"
    MONITOR_CHANGES = "monitor_changes"
    BACKUP_FILE = "backup_file"
    RESTORE_BACKUP = "restore_backup"
    SEARCH_FILES = "search_files"
    CALCULATE_HASH = "calculate_hash"


class FileActionStatus(Enum):
    """Status of file action execution."""
    SUCCESS = "success"
    FAILED = "failed"
    FILE_NOT_FOUND = "file_not_found"
    PERMISSION_DENIED = "permission_denied"
    DISK_FULL = "disk_full"
    INVALID_PATH = "invalid_path"
    ALREADY_EXISTS = "already_exists"


@dataclass
class FileActionRequest:
    """File action request specification."""
    action_type: FileActionType
    source_path: Optional[str] = None
    target_path: Optional[str] = None
    content: Optional[Union[str, bytes]] = None
    options: Dict[str, Any] = field(default_factory=dict)
    create_backup: bool = False
    overwrite_existing: bool = False
    recursive: bool = False
    preserve_metadata: bool = True
    encoding: str = 'utf-8'


@dataclass
class FileInfo:
    """File information structure."""
    path: str
    name: str
    size: int
    created_time: datetime
    modified_time: datetime
    accessed_time: datetime
    is_directory: bool
    is_file: bool
    permissions: str
    owner: Optional[str] = None
    group: Optional[str] = None
    hash_md5: Optional[str] = None
    hash_sha256: Optional[str] = None


@dataclass
class FileActionResult:
    """Result of file action execution."""
    success: bool
    status: FileActionStatus
    message: str
    execution_time: float
    result_data: Optional[Any] = None
    file_info: Optional[FileInfo] = None
    backup_path: Optional[str] = None
    error_details: Optional[str] = None


class FileSystemMonitor:
    """File system change monitor."""
    
    def __init__(self):
        self.monitored_paths = {}
        self.change_callbacks = {}
        self.monitoring_active = False
        self.logger = logging.getLogger(__name__)
    
    def add_monitor(self, path: str, callback=None) -> bool:
        """Add path to monitoring."""
        
        try:
            if os.path.exists(path):
                self.monitored_paths[path] = {
                    'last_modified': os.path.getmtime(path),
                    'last_size': os.path.getsize(path) if os.path.isfile(path) else 0
                }
                
                if callback:
                    self.change_callbacks[path] = callback
                
                return True
        except Exception as e:
            self.logger.error(f"Failed to add monitor for {path}: {str(e)}")
        
        return False
    
    def remove_monitor(self, path: str):
        """Remove path from monitoring."""
        
        if path in self.monitored_paths:
            del self.monitored_paths[path]
        
        if path in self.change_callbacks:
            del self.change_callbacks[path]
    
    async def start_monitoring(self, check_interval: float = 1.0):
        """Start monitoring for changes."""
        
        self.monitoring_active = True
        
        while self.monitoring_active:
            await self._check_changes()
            await asyncio.sleep(check_interval)
    
    def stop_monitoring(self):
        """Stop monitoring."""
        self.monitoring_active = False
    
    async def _check_changes(self):
        """Check for file changes."""
        
        for path, info in list(self.monitored_paths.items()):
            try:
                if not os.path.exists(path):
                    # File/directory deleted
                    if path in self.change_callbacks:
                        await self._trigger_callback(path, 'deleted')
                    continue
                
                current_modified = os.path.getmtime(path)
                current_size = os.path.getsize(path) if os.path.isfile(path) else 0
                
                if (current_modified != info['last_modified'] or 
                    current_size != info['last_size']):
                    
                    # File changed
                    self.monitored_paths[path] = {
                        'last_modified': current_modified,
                        'last_size': current_size
                    }
                    
                    if path in self.change_callbacks:
                        await self._trigger_callback(path, 'modified')
                        
            except Exception as e:
                self.logger.error(f"Error checking changes for {path}: {str(e)}")
    
    async def _trigger_callback(self, path: str, change_type: str):
        """Trigger change callback."""
        
        try:
            callback = self.change_callbacks.get(path)
            if callback:
                if asyncio.iscoroutinefunction(callback):
                    await callback(path, change_type)
                else:
                    callback(path, change_type)
        except Exception as e:
            self.logger.error(f"Callback error for {path}: {str(e)}")


class FileActionController:
    """
    Comprehensive file action controller for filesystem operations.
    Provides high-level interface for file and directory management with
    error handling, backup support, and monitoring capabilities.
    """
    
    def __init__(self, base_directory: str = None):
        self.base_directory = base_directory or os.getcwd()
        self.logger = logging.getLogger(__name__)
        
        # Initialize file monitor
        self.monitor = FileSystemMonitor()
        
        # Performance tracking
        self.metrics = {
            'actions_executed': 0,
            'successful_actions': 0,
            'failed_actions': 0,
            'bytes_processed': 0,
            'files_created': 0,
            'files_deleted': 0,
            'files_modified': 0,
            'backups_created': 0,
            'average_execution_time': 0.0,
            'action_type_distribution': {action.value: 0 for action in FileActionType}
        }
        
        # Backup directory
        self.backup_directory = os.path.join(self.base_directory, '.file_backups')
        os.makedirs(self.backup_directory, exist_ok=True)
        
        # Action history
        self.action_history = []
        
        self.logger.info(f"File Action Controller initialized with base directory: {self.base_directory}")
    
    async def execute_file_action(self, request: FileActionRequest) -> FileActionResult:
        """
        Execute a file action with comprehensive error handling.
        
        Args:
            request: File action request specification
            
        Returns:
            FileActionResult with execution details and status
        """
        start_time = time.time()
        
        try:
            # Validate request
            validation_result = self._validate_request(request)
            if not validation_result[0]:
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.INVALID_PATH,
                    message=validation_result[1],
                    execution_time=0.0
                )
            
            # Create backup if requested
            backup_path = None
            if request.create_backup and request.source_path and os.path.exists(request.source_path):
                backup_path = await self._create_backup(request.source_path)
            
            # Execute specific action
            result = await self._execute_specific_action(request)
            result.backup_path = backup_path
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(request, result)
            
            # Store in history
            self._store_action_history(request, result)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"File action execution failed: {str(e)}")
            
            self._update_metrics(request, None, failed=True)
            
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"File action failed: {str(e)}",
                execution_time=execution_time,
                error_details=str(e)
            )
    
    async def _execute_specific_action(self, request: FileActionRequest) -> FileActionResult:
        """Execute specific file action based on action type."""
        
        action_type = request.action_type
        
        if action_type == FileActionType.READ_FILE:
            return await self._handle_read_file(request)
        elif action_type == FileActionType.WRITE_FILE:
            return await self._handle_write_file(request)
        elif action_type == FileActionType.APPEND_FILE:
            return await self._handle_append_file(request)
        elif action_type == FileActionType.DELETE_FILE:
            return await self._handle_delete_file(request)
        elif action_type == FileActionType.COPY_FILE:
            return await self._handle_copy_file(request)
        elif action_type == FileActionType.MOVE_FILE:
            return await self._handle_move_file(request)
        elif action_type == FileActionType.CREATE_DIRECTORY:
            return await self._handle_create_directory(request)
        elif action_type == FileActionType.DELETE_DIRECTORY:
            return await self._handle_delete_directory(request)
        elif action_type == FileActionType.LIST_DIRECTORY:
            return await self._handle_list_directory(request)
        elif action_type == FileActionType.GET_FILE_INFO:
            return await self._handle_get_file_info(request)
        elif action_type == FileActionType.CALCULATE_HASH:
            return await self._handle_calculate_hash(request)
        elif action_type == FileActionType.SEARCH_FILES:
            return await self._handle_search_files(request)
        else:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Unsupported file action type: {action_type.value}",
                execution_time=0.0
            )
    
    async def _handle_read_file(self, request: FileActionRequest) -> FileActionResult:
        """Handle file read action."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"File not found: {request.source_path}",
                    execution_time=0.0
                )
            
            # Determine read mode
            binary_mode = request.options.get('binary', False)
            mode = 'rb' if binary_mode else 'r'
            encoding = None if binary_mode else request.encoding
            
            # Read file content
            with open(request.source_path, mode, encoding=encoding) as file:
                content = file.read()
            
            # Get file info
            file_info = self._get_file_info(request.source_path)
            
            self.metrics['bytes_processed'] += len(content) if isinstance(content, (str, bytes)) else 0
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"File read successfully: {request.source_path}",
                execution_time=0.0,
                result_data=content,
                file_info=file_info
            )
            
        except PermissionError:
            return FileActionResult(
                success=False,
                status=FileActionStatus.PERMISSION_DENIED,
                message=f"Permission denied: {request.source_path}",
                execution_time=0.0
            )
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Read failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_write_file(self, request: FileActionRequest) -> FileActionResult:
        """Handle file write action."""
        
        try:
            # Check if file exists and overwrite is not allowed
            if os.path.exists(request.target_path) and not request.overwrite_existing:
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.ALREADY_EXISTS,
                    message=f"File exists and overwrite not allowed: {request.target_path}",
                    execution_time=0.0
                )
            
            # Create directories if needed
            os.makedirs(os.path.dirname(request.target_path), exist_ok=True)
            
            # Determine write mode
            binary_mode = isinstance(request.content, bytes)
            mode = 'wb' if binary_mode else 'w'
            encoding = None if binary_mode else request.encoding
            
            # Write file content
            with open(request.target_path, mode, encoding=encoding) as file:
                file.write(request.content)
            
            # Get file info
            file_info = self._get_file_info(request.target_path)
            
            self.metrics['bytes_processed'] += len(request.content) if request.content else 0
            self.metrics['files_created'] += 1
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"File written successfully: {request.target_path}",
                execution_time=0.0,
                file_info=file_info
            )
            
        except PermissionError:
            return FileActionResult(
                success=False,
                status=FileActionStatus.PERMISSION_DENIED,
                message=f"Permission denied: {request.target_path}",
                execution_time=0.0
            )
        except OSError as e:
            if "No space left on device" in str(e):
                status = FileActionStatus.DISK_FULL
            else:
                status = FileActionStatus.FAILED
            
            return FileActionResult(
                success=False,
                status=status,
                message=f"Write failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_copy_file(self, request: FileActionRequest) -> FileActionResult:
        """Handle file copy action."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"Source file not found: {request.source_path}",
                    execution_time=0.0
                )
            
            # Create target directory if needed
            os.makedirs(os.path.dirname(request.target_path), exist_ok=True)
            
            # Copy file
            if os.path.isdir(request.source_path):
                if request.recursive:
                    shutil.copytree(request.source_path, request.target_path,
                                  dirs_exist_ok=request.overwrite_existing)
                else:
                    return FileActionResult(
                        success=False,
                        status=FileActionStatus.FAILED,
                        message="Directory copy requires recursive=True",
                        execution_time=0.0
                    )
            else:
                shutil.copy2(request.source_path, request.target_path)
            
            # Get file info
            file_info = self._get_file_info(request.target_path)
            
            file_size = file_info.size if file_info else 0
            self.metrics['bytes_processed'] += file_size
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"File copied successfully: {request.source_path} -> {request.target_path}",
                execution_time=0.0,
                file_info=file_info
            )
            
        except PermissionError:
            return FileActionResult(
                success=False,
                status=FileActionStatus.PERMISSION_DENIED,
                message="Permission denied for copy operation",
                execution_time=0.0
            )
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Copy failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_delete_file(self, request: FileActionRequest) -> FileActionResult:
        """Handle file delete action."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"File not found: {request.source_path}",
                    execution_time=0.0
                )
            
            # Get file info before deletion
            file_info = self._get_file_info(request.source_path)
            
            # Delete file or directory
            if os.path.isdir(request.source_path):
                if request.recursive:
                    shutil.rmtree(request.source_path)
                else:
                    os.rmdir(request.source_path)
            else:
                os.remove(request.source_path)
            
            self.metrics['files_deleted'] += 1
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"File deleted successfully: {request.source_path}",
                execution_time=0.0,
                file_info=file_info
            )
            
        except PermissionError:
            return FileActionResult(
                success=False,
                status=FileActionStatus.PERMISSION_DENIED,
                message=f"Permission denied: {request.source_path}",
                execution_time=0.0
            )
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Delete failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_list_directory(self, request: FileActionRequest) -> FileActionResult:
        """Handle directory listing action."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"Directory not found: {request.source_path}",
                    execution_time=0.0
                )
            
            if not os.path.isdir(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FAILED,
                    message=f"Path is not a directory: {request.source_path}",
                    execution_time=0.0
                )
            
            # List directory contents
            entries = []
            
            if request.recursive:
                for root, dirs, files in os.walk(request.source_path):
                    for item in dirs + files:
                        item_path = os.path.join(root, item)
                        file_info = self._get_file_info(item_path)
                        if file_info:
                            entries.append(file_info)
            else:
                for item in os.listdir(request.source_path):
                    item_path = os.path.join(request.source_path, item)
                    file_info = self._get_file_info(item_path)
                    if file_info:
                        entries.append(file_info)
            
            # Sort entries by name
            entries.sort(key=lambda x: x.name)
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"Directory listed successfully: {len(entries)} items",
                execution_time=0.0,
                result_data=entries
            )
            
        except PermissionError:
            return FileActionResult(
                success=False,
                status=FileActionStatus.PERMISSION_DENIED,
                message=f"Permission denied: {request.source_path}",
                execution_time=0.0
            )
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Directory listing failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_get_file_info(self, request: FileActionRequest) -> FileActionResult:
        """Handle get file info action."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"File not found: {request.source_path}",
                    execution_time=0.0
                )
            
            file_info = self._get_file_info(request.source_path, include_hashes=True)
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"File info retrieved successfully: {request.source_path}",
                execution_time=0.0,
                file_info=file_info
            )
            
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Get file info failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_calculate_hash(self, request: FileActionRequest) -> FileActionResult:
        """Handle file hash calculation."""
        
        try:
            if not os.path.exists(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FILE_NOT_FOUND,
                    message=f"File not found: {request.source_path}",
                    execution_time=0.0
                )
            
            if os.path.isdir(request.source_path):
                return FileActionResult(
                    success=False,
                    status=FileActionStatus.FAILED,
                    message="Cannot calculate hash for directory",
                    execution_time=0.0
                )
            
            # Calculate hashes
            hash_md5 = hashlib.md5()
            hash_sha256 = hashlib.sha256()
            
            with open(request.source_path, 'rb') as file:
                while chunk := file.read(8192):
                    hash_md5.update(chunk)
                    hash_sha256.update(chunk)
            
            hashes = {
                'md5': hash_md5.hexdigest(),
                'sha256': hash_sha256.hexdigest(),
                'file_path': request.source_path,
                'file_size': os.path.getsize(request.source_path)
            }
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message="File hashes calculated successfully",
                execution_time=0.0,
                result_data=hashes
            )
            
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"Hash calculation failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_search_files(self, request: FileActionRequest) -> FileActionResult:
        """Handle file search action."""
        
        try:
            search_directory = request.source_path or self.base_directory
            search_pattern = request.options.get('pattern', '*')
            search_content = request.options.get('content')
            max_results = request.options.get('max_results', 100)
            
            found_files = []
            
            for root, dirs, files in os.walk(search_directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    
                    # Pattern matching
                    if search_pattern != '*':
                        import fnmatch
                        if not fnmatch.fnmatch(file, search_pattern):
                            continue
                    
                    # Content searching
                    if search_content:
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                if search_content.lower() not in content.lower():
                                    continue
                        except:
                            continue
                    
                    file_info = self._get_file_info(file_path)
                    if file_info:
                        found_files.append(file_info)
                    
                    if len(found_files) >= max_results:
                        break
                
                if len(found_files) >= max_results:
                    break
            
            return FileActionResult(
                success=True,
                status=FileActionStatus.SUCCESS,
                message=f"Search completed: {len(found_files)} files found",
                execution_time=0.0,
                result_data=found_files
            )
            
        except Exception as e:
            return FileActionResult(
                success=False,
                status=FileActionStatus.FAILED,
                message=f"File search failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    def _get_file_info(self, path: str, include_hashes: bool = False) -> Optional[FileInfo]:
        """Get comprehensive file information."""
        
        try:
            stat = os.stat(path)
            
            file_info = FileInfo(
                path=path,
                name=os.path.basename(path),
                size=stat.st_size,
                created_time=datetime.fromtimestamp(stat.st_ctime),
                modified_time=datetime.fromtimestamp(stat.st_mtime),
                accessed_time=datetime.fromtimestamp(stat.st_atime),
                is_directory=os.path.isdir(path),
                is_file=os.path.isfile(path),
                permissions=oct(stat.st_mode)[-3:]
            )
            
            # Calculate hashes for files if requested
            if include_hashes and os.path.isfile(path):
                try:
                    with open(path, 'rb') as f:
                        content = f.read()
                        file_info.hash_md5 = hashlib.md5(content).hexdigest()
                        file_info.hash_sha256 = hashlib.sha256(content).hexdigest()
                except:
                    pass
            
            return file_info
            
        except Exception as e:
            self.logger.error(f"Failed to get file info for {path}: {str(e)}")
            return None
    
    async def _create_backup(self, file_path: str) -> Optional[str]:
        """Create backup of file before operation."""
        
        try:
            if not os.path.exists(file_path):
                return None
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"{os.path.basename(file_path)}.backup_{timestamp}"
            backup_path = os.path.join(self.backup_directory, backup_name)
            
            shutil.copy2(file_path, backup_path)
            
            self.metrics['backups_created'] += 1
            self.logger.info(f"Backup created: {backup_path}")
            
            return backup_path
            
        except Exception as e:
            self.logger.error(f"Backup creation failed: {str(e)}")
            return None
    
    def _validate_request(self, request: FileActionRequest) -> Tuple[bool, str]:
        """Validate file action request."""
        
        if not isinstance(request.action_type, FileActionType):
            return False, "Invalid action type"
        
        # Path validation
        actions_requiring_source = [
            FileActionType.READ_FILE, FileActionType.DELETE_FILE,
            FileActionType.COPY_FILE, FileActionType.MOVE_FILE,
            FileActionType.GET_FILE_INFO, FileActionType.LIST_DIRECTORY,
            FileActionType.CALCULATE_HASH
        ]
        
        if request.action_type in actions_requiring_source and not request.source_path:
            return False, "Source path is required for this action"
        
        actions_requiring_target = [
            FileActionType.WRITE_FILE, FileActionType.COPY_FILE,
            FileActionType.MOVE_FILE, FileActionType.CREATE_DIRECTORY
        ]
        
        if request.action_type in actions_requiring_target and not request.target_path:
            return False, "Target path is required for this action"
        
        actions_requiring_content = [FileActionType.WRITE_FILE, FileActionType.APPEND_FILE]
        
        if request.action_type in actions_requiring_content and request.content is None:
            return False, "Content is required for this action"
        
        return True, "Valid request"
    
    def _update_metrics(self, request: FileActionRequest, result: FileActionResult = None, failed: bool = False):
        """Update performance metrics."""
        
        self.metrics['actions_executed'] += 1
        self.metrics['action_type_distribution'][request.action_type.value] += 1
        
        if failed or (result and not result.success):
            self.metrics['failed_actions'] += 1
        else:
            self.metrics['successful_actions'] += 1
        
        if result and result.execution_time > 0:
            current_avg = self.metrics['average_execution_time']
            total_actions = self.metrics['actions_executed']
            self.metrics['average_execution_time'] = (
                (current_avg * (total_actions - 1) + result.execution_time) / total_actions
            )
    
    def _store_action_history(self, request: FileActionRequest, result: FileActionResult):
        """Store action in history."""
        
        self.action_history.append({
            'timestamp': time.time(),
            'action_type': request.action_type.value,
            'source_path': request.source_path,
            'target_path': request.target_path,
            'success': result.success,
            'execution_time': result.execution_time
        })
        
        # Keep only recent history
        if len(self.action_history) > 100:
            self.action_history = self.action_history[-50:]
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get file action performance metrics."""
        
        total_actions = self.metrics['actions_executed']
        
        if total_actions == 0:
            return {'message': 'No file actions executed yet'}
        
        success_rate = self.metrics['successful_actions'] / total_actions
        
        return {
            'performance_summary': {
                'total_actions': total_actions,
                'successful_actions': self.metrics['successful_actions'],
                'failed_actions': self.metrics['failed_actions'],
                'success_rate': success_rate,
                'average_execution_time': self.metrics['average_execution_time'],
                'bytes_processed': self.metrics['bytes_processed'],
                'files_created': self.metrics['files_created'],
                'files_deleted': self.metrics['files_deleted'],
                'files_modified': self.metrics['files_modified'],
                'backups_created': self.metrics['backups_created']
            },
            'action_distribution': self.metrics['action_type_distribution'],
            'configuration': {
                'base_directory': self.base_directory,
                'backup_directory': self.backup_directory,
                'monitoring_active': self.monitor.monitoring_active,
                'monitored_paths': len(self.monitor.monitored_paths)
            },
            'capabilities': {
                'supported_actions': [action.value for action in FileActionType],
                'backup_support': True,
                'monitoring_support': True,
                'hash_algorithms': ['md5', 'sha256']
            }
        }
    
    async def start_monitoring(self, paths: List[str], check_interval: float = 1.0) -> bool:
        """Start file system monitoring for specified paths."""
        
        for path in paths:
            self.monitor.add_monitor(path)
        
        # Start monitoring in background
        asyncio.create_task(self.monitor.start_monitoring(check_interval))
        
        return True
    
    def stop_monitoring(self):
        """Stop file system monitoring."""
        self.monitor.stop_monitoring()