"""
Logging utilities for RomAI system.

Provides structured logging, performance monitoring, and audit trails.
"""

import json
import logging
import time
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path
from typing import Any, Dict, Optional, Callable, List
from dataclasses import dataclass, asdict
from contextlib import contextmanager
import threading


@dataclass
class LogEntry:
    """Structured log entry."""
    timestamp: str
    level: str
    logger_name: str
    message: str
    module: str
    function: str
    line_number: int
    thread_id: int
    process_id: int
    metadata: Dict[str, Any]


@dataclass
class PerformanceMetric:
    """Performance measurement data."""
    operation: str
    start_time: float
    end_time: float
    duration: float
    success: bool
    metadata: Dict[str, Any]


class RomAIFormatter(logging.Formatter):
    """Custom formatter for RomAI logging."""
    
    def __init__(self, include_metadata: bool = True):
        super().__init__()
        self.include_metadata = include_metadata
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with RomAI structure."""
        
        # Create base log entry
        log_entry = LogEntry(
            timestamp=datetime.now(timezone.utc).isoformat(),
            level=record.levelname,
            logger_name=record.name,
            message=record.getMessage(),
            module=record.module,
            function=record.funcName,
            line_number=record.lineno,
            thread_id=threading.get_ident(),
            process_id=record.process,
            metadata=getattr(record, 'metadata', {})
        )
        
        # Add exception info if present
        if record.exc_info:
            log_entry.metadata['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields from record
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 
                          'filename', 'module', 'lineno', 'funcName', 'created',
                          'msecs', 'relativeCreated', 'thread', 'threadName',
                          'processName', 'process', 'exc_info', 'exc_text', 'stack_info',
                          'getMessage', 'metadata']:
                log_entry.metadata[key] = value
        
        # Format as JSON for structured logging
        if self.include_metadata:
            return json.dumps(asdict(log_entry), default=str, ensure_ascii=False)
        else:
            return f"{log_entry.timestamp} - {log_entry.logger_name} - {log_entry.level} - {log_entry.message}"


class PerformanceLogger:
    """Logger for performance metrics and monitoring."""
    
    def __init__(self, logger_name: str = "romai.performance"):
        self.logger = logging.getLogger(logger_name)
        self._metrics: List[PerformanceMetric] = []
        self._lock = threading.Lock()
    
    @contextmanager
    def measure(self, operation: str, **metadata):
        """Context manager for measuring operation performance."""
        start_time = time.perf_counter()
        success = True
        error = None
        
        try:
            yield
        except Exception as e:
            success = False
            error = str(e)
            raise
        finally:
            end_time = time.perf_counter()
            duration = end_time - start_time
            
            # Create metric
            metric_metadata = metadata.copy()
            if error:
                metric_metadata['error'] = error
            
            metric = PerformanceMetric(
                operation=operation,
                start_time=start_time,
                end_time=end_time,
                duration=duration,
                success=success,
                metadata=metric_metadata
            )
            
            # Store metric
            with self._lock:
                self._metrics.append(metric)
            
            # Log performance data
            self.logger.info(
                f"Operation '{operation}' completed",
                extra={
                    'metadata': {
                        'duration': duration,
                        'success': success,
                        'operation': operation,
                        **metric_metadata
                    }
                }
            )
    
    def get_metrics(self, operation: Optional[str] = None, 
                   since: Optional[float] = None) -> List[PerformanceMetric]:
        """Get performance metrics with optional filtering."""
        with self._lock:
            metrics = self._metrics.copy()
        
        if operation:
            metrics = [m for m in metrics if m.operation == operation]
        
        if since:
            metrics = [m for m in metrics if m.start_time >= since]
        
        return metrics
    
    def get_stats(self, operation: Optional[str] = None) -> Dict[str, Any]:
        """Get performance statistics."""
        metrics = self.get_metrics(operation)
        
        if not metrics:
            return {}
        
        durations = [m.duration for m in metrics]
        success_rate = sum(1 for m in metrics if m.success) / len(metrics)
        
        return {
            'total_operations': len(metrics),
            'success_rate': success_rate,
            'average_duration': sum(durations) / len(durations),
            'min_duration': min(durations),
            'max_duration': max(durations),
            'total_duration': sum(durations)
        }
    
    def clear_metrics(self, before: Optional[float] = None):
        """Clear stored metrics."""
        with self._lock:
            if before:
                self._metrics = [m for m in self._metrics if m.start_time >= before]
            else:
                self._metrics.clear()


class AuditLogger:
    """Logger for audit trails and security events."""
    
    def __init__(self, logger_name: str = "romai.audit"):
        self.logger = logging.getLogger(logger_name)
    
    def log_user_action(self, user_id: Optional[str], action: str, 
                       resource: Optional[str] = None, **metadata):
        """Log user action for audit trail."""
        self.logger.info(
            f"User action: {action}",
            extra={
                'metadata': {
                    'event_type': 'user_action',
                    'user_id': user_id,
                    'action': action,
                    'resource': resource,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    **metadata
                }
            }
        )
    
    def log_system_event(self, event_type: str, description: str, **metadata):
        """Log system event for monitoring."""
        self.logger.info(
            f"System event: {description}",
            extra={
                'metadata': {
                    'event_type': event_type,
                    'description': description,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    **metadata
                }
            }
        )
    
    def log_security_event(self, event_type: str, description: str, 
                          severity: str = "medium", **metadata):
        """Log security-related event."""
        log_level = {
            'low': logging.INFO,
            'medium': logging.WARNING,
            'high': logging.ERROR,
            'critical': logging.CRITICAL
        }.get(severity, logging.WARNING)
        
        self.logger.log(
            log_level,
            f"Security event: {description}",
            extra={
                'metadata': {
                    'event_type': 'security',
                    'security_event_type': event_type,
                    'description': description,
                    'severity': severity,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    **metadata
                }
            }
        )


class ErrorLogger:
    """Specialized logger for error tracking and analysis."""
    
    def __init__(self, logger_name: str = "romai.errors"):
        self.logger = logging.getLogger(logger_name)
        self._error_counts: Dict[str, int] = {}
        self._lock = threading.Lock()
    
    def log_error(self, error: Exception, context: str, **metadata):
        """Log error with context and tracking."""
        error_type = type(error).__name__
        error_message = str(error)
        
        # Track error frequency
        with self._lock:
            error_key = f"{error_type}:{context}"
            self._error_counts[error_key] = self._error_counts.get(error_key, 0) + 1
        
        self.logger.error(
            f"Error in {context}: {error_message}",
            extra={
                'metadata': {
                    'error_type': error_type,
                    'error_message': error_message,
                    'context': context,
                    'error_count': self._error_counts[error_key],
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    **metadata
                }
            },
            exc_info=True
        )
    
    def get_error_stats(self) -> Dict[str, int]:
        """Get error frequency statistics."""
        with self._lock:
            return self._error_counts.copy()


def setup_logging(log_level: str = "INFO", 
                 log_file: Optional[Path] = None,
                 structured_logging: bool = True) -> Dict[str, logging.Logger]:
    """Setup comprehensive logging for RomAI system."""
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Create formatter
    formatter = RomAIFormatter(include_metadata=structured_logging)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    root_logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        file_handler.setLevel(getattr(logging, log_level.upper()))
        root_logger.addHandler(file_handler)
    
    # Create specialized loggers
    loggers = {
        'main': logging.getLogger('romai'),
        'math': logging.getLogger('romai.math'),
        'logic': logging.getLogger('romai.logic'),
        'neural': logging.getLogger('romai.neural'),
        'api': logging.getLogger('romai.api'),
        'performance': logging.getLogger('romai.performance'),
        'audit': logging.getLogger('romai.audit'),
        'errors': logging.getLogger('romai.errors'),
        'security': logging.getLogger('romai.security')
    }
    
    return loggers


def performance_monitor(operation_name: Optional[str] = None):
    """Decorator for automatic performance monitoring."""
    def decorator(func: Callable) -> Callable:
        perf_logger = PerformanceLogger()
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            name = operation_name or f"{func.__module__}.{func.__name__}"
            with perf_logger.measure(name, function=func.__name__, module=func.__module__):
                return await func(*args, **kwargs)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            name = operation_name or f"{func.__module__}.{func.__name__}"
            with perf_logger.measure(name, function=func.__name__, module=func.__module__):
                return func(*args, **kwargs)
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def error_handler(context: Optional[str] = None, 
                 reraise: bool = True):
    """Decorator for automatic error logging."""
    def decorator(func: Callable) -> Callable:
        error_logger = ErrorLogger()
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            ctx = context or f"{func.__module__}.{func.__name__}"
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                error_logger.log_error(e, ctx, function=func.__name__, module=func.__module__)
                if reraise:
                    raise
                return None
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            ctx = context or f"{func.__module__}.{func.__name__}"
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_logger.log_error(e, ctx, function=func.__name__, module=func.__module__)
                if reraise:
                    raise
                return None
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Global logger instances for convenience
performance_logger = PerformanceLogger()
audit_logger = AuditLogger()
error_logger = ErrorLogger()