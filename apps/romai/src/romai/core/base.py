"""
Base engine class for all RomAI reasoning engines.

Provides common functionality and interface for mathematical, logical,
creative, and cultural reasoning engines.
"""

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from .types import EngineConfig, EngineStatus


logger = logging.getLogger(__name__)


class BaseEngine(ABC):
    """Abstract base class for all reasoning engines."""
    
    def __init__(self, config: Optional[EngineConfig] = None):
        """Initialize base engine with configuration."""
        self.config = config or EngineConfig()
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        self.logger.setLevel(getattr(logging, self.config.log_level))
        
        # Performance tracking
        self._operation_count = 0
        self._total_processing_time = 0.0
        
    @property
    def name(self) -> str:
        """Return engine name."""
        return self.__class__.__name__
        
    @property
    def average_processing_time(self) -> float:
        """Return average processing time per operation."""
        if self._operation_count == 0:
            return 0.0
        return self._total_processing_time / self._operation_count
    
    @abstractmethod
    async def process(self, input_data: str, **kwargs) -> Any:
        """
        Process input data and return a result.
        
        Args:
            input_data: The input data to process
            **kwargs: Additional arguments specific to the engine
        
        Returns:
            Any: Engine-specific result object
        """
        pass
    
    def validate_input(self, input_data: Any) -> bool:
        """
        Validate input data before processing.
        
        Args:
            input_data: The input to validate
            
        Returns:
            bool: True if input is valid
        """
        return input_data is not None and str(input_data).strip()
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on the engine.
        
        Returns:
            Dict[str, Any]: Health status information
        """
        return {
            'status': 'healthy',
            'name': self.name,
            'operation_count': self._operation_count,
            'average_processing_time': self.average_processing_time,
            'config': {
                'timeout_seconds': self.config.timeout_seconds,
                'confidence_threshold': self.config.confidence_threshold
            }
        }
    
    async def process_with_timeout(self, input_data: str, **kwargs) -> Any:
        """
        Process input with timeout protection.
        
        Args:
            input_data: The input data to process
            **kwargs: Additional arguments
            
        Returns:
            Any: Processing result
            
        Raises:
            asyncio.TimeoutError: If processing exceeds timeout
        """
        start_time = time.time()
        
        try:
            # Process with timeout
            result = await asyncio.wait_for(
                self.process(input_data, **kwargs),
                timeout=self.config.timeout_seconds
            )
            
            # Update performance tracking
            processing_time = time.time() - start_time
            self._operation_count += 1
            self._total_processing_time += processing_time
            
            return result
            
        except asyncio.TimeoutError:
            self.logger.error(f"Processing timeout after {self.config.timeout_seconds}s")
            raise
        except Exception as e:
            self.logger.error(f"Processing error: {e}")
            raise
    
    def __str__(self) -> str:
        """Return string representation."""
        return f"{self.name}(operations={self._operation_count}, avg_time={self.average_processing_time:.3f}s)"
    
    def __repr__(self) -> str:
        """Return detailed representation."""
        return f"{self.__class__.__name__}(config={self.config})"
    
    def _record_operation(self, processing_time: float) -> None:
        """Record operation for performance tracking."""
        self._operation_count += 1
        self._total_processing_time += processing_time
    
    def _create_error_result(self, error_message: str, processing_time: float) -> Any:
        """Create a standardized error result."""
        from .types import EngineStatus
        
        # This will be overridden by child classes to return appropriate result type
        return {
            'status': EngineStatus.ERROR,
            'error': error_message,
            'processing_time': processing_time,
            'confidence': 0.0
        }