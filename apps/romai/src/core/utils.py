"""
Core utilities for RomAI AGI system
===================================

Common utilities including logging, performance monitoring, and metrics.
"""

import logging
import time
import functools
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from collections import defaultdict

def get_logger(name: str) -> logging.Logger:
    """Get a configured logger"""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

def profile_operation(func: Callable) -> Callable:
    """Decorator to profile operation performance"""
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger = get_logger(func.__module__)
            logger.info(f"{func.__name__} completed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger = get_logger(func.__module__)
            logger.error(f"{func.__name__} failed after {execution_time:.3f}s: {e}")
            raise
    
    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger = get_logger(func.__module__)
            logger.info(f"{func.__name__} completed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger = get_logger(func.__module__)
            logger.error(f"{func.__name__} failed after {execution_time:.3f}s: {e}")
            raise
    
    # Return appropriate wrapper based on function type
    if hasattr(func, '__code__') and 'await' in func.__code__.co_names:
        return async_wrapper
    else:
        return sync_wrapper

@dataclass
class PerformanceMetrics:
    """Performance metrics collection"""
    operations: Dict[str, List[float]] = field(default_factory=lambda: defaultdict(list))
    metadata: Dict[str, List[Dict[str, Any]]] = field(default_factory=lambda: defaultdict(list))
    
    def record_operation(self, operation: str, duration: float, metadata: Optional[Dict[str, Any]] = None):
        """Record an operation's performance"""
        self.operations[operation].append(duration)
        if metadata:
            self.metadata[operation].append(metadata)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        summary = {}
        for operation, durations in self.operations.items():
            if durations:
                summary[operation] = {
                    "count": len(durations),
                    "avg_duration": sum(durations) / len(durations),
                    "min_duration": min(durations),
                    "max_duration": max(durations),
                    "total_duration": sum(durations)
                }
        return summary
    
    def get_operation_stats(self, operation: str) -> Optional[Dict[str, Any]]:
        """Get stats for specific operation"""
        if operation in self.operations:
            durations = self.operations[operation]
            return {
                "count": len(durations),
                "avg_duration": sum(durations) / len(durations),
                "min_duration": min(durations),
                "max_duration": max(durations),
                "total_duration": sum(durations)
            }
        return None
