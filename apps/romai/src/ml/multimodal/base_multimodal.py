"""
Base Multi-Modal Processor
==========================

Foundation for all multi-modal processing components.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Tuple
import numpy as np


class ModalityType(Enum):
    """Types of modalities"""
    VISION = "vision"
    AUDIO = "audio"
    VIDEO = "video"
    TEXT = "text"
    ROMANIAN_CULTURAL = "romanian_cultural"


class ProcessingMode(Enum):
    """Processing modes for multi-modal data"""
    FAST = "fast"
    THOROUGH = "thorough"
    CULTURAL_AWARE = "cultural_aware"
    REAL_TIME = "real_time"


@dataclass
class MultiModalConfig:
    """Configuration for multi-modal processing"""
    # General settings
    max_concurrent_processing: int = 10
    processing_timeout: int = 30
    cache_enabled: bool = True
    
    # Vision settings
    vision_model_path: str = "models/vision/ruaga_vision.pth"
    max_image_resolution: Tuple[int, int] = (2048, 2048)
    supported_image_formats: List[str] = field(default_factory=lambda: ['jpg', 'png', 'webp'])
    
    # Audio settings
    audio_model_path: str = "models/audio/ruaga_audio.pth"
    max_audio_duration: int = 300  # seconds
    supported_audio_formats: List[str] = field(default_factory=lambda: ['wav', 'mp3', 'flac'])
    
    # Video settings
    video_model_path: str = "models/video/ruaga_video.pth"
    max_video_duration: int = 600  # seconds
    supported_video_formats: List[str] = field(default_factory=lambda: ['mp4', 'avi', 'mov'])
    
    # Romanian cultural settings
    romanian_cultural_enabled: bool = True
    cultural_recognition_threshold: float = 0.8
    folklore_database_path: str = "data/romanian_cultural/folklore.db"
    traditional_music_models: str = "models/romanian/traditional_music.pth"


@dataclass
class MultiModalInput:
    """Input data for multi-modal processing"""
    modality: ModalityType
    data: Union[str, bytes, np.ndarray]
    metadata: Dict[str, Any] = field(default_factory=dict)
    processing_mode: ProcessingMode = ProcessingMode.THOROUGH
    romanian_context: bool = False


@dataclass
class MultiModalOutput:
    """Output from multi-modal processing"""
    modality: ModalityType
    features: Dict[str, Any]
    embeddings: Optional[np.ndarray] = None
    cultural_analysis: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    processing_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseMultiModalProcessor:
    """Base class for all multi-modal processors"""
    
    def __init__(self, config: MultiModalConfig):
        self.config = config
        self.cache = {} if config.cache_enabled else None
        self.processing_queue = asyncio.Queue(maxsize=config.max_concurrent_processing)
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the processor"""
        logging.info(f"Initializing {self.__class__.__name__}")
        await self._load_models()
        await self._setup_processing_pipeline()
        self.is_initialized = True
        logging.info(f"{self.__class__.__name__} initialized successfully")
        
    async def _load_models(self):
        """Load required models - to be implemented by subclasses"""
        pass
        
    async def _setup_processing_pipeline(self):
        """Setup processing pipeline - to be implemented by subclasses"""
        pass
        
    async def process(self, input_data: MultiModalInput) -> MultiModalOutput:
        """Process multi-modal input"""
        if not self.is_initialized:
            raise RuntimeError(f"{self.__class__.__name__} not initialized")
            
        start_time = datetime.now()
        
        try:
            # Check cache
            if self.cache is not None:
                cache_key = self._generate_cache_key(input_data)
                if cache_key in self.cache:
                    return self.cache[cache_key]
            
            # Process data
            output = await self._process_internal(input_data)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            output.processing_time = processing_time
            
            # Cache result
            if self.cache is not None:
                cache_key = self._generate_cache_key(input_data)
                self.cache[cache_key] = output
                
            return output
            
        except Exception as e:
            logging.error(f"Processing failed: {str(e)}")
            raise
            
    async def _process_internal(self, input_data: MultiModalInput) -> MultiModalOutput:
        """Internal processing - to be implemented by subclasses"""
        raise NotImplementedError
        
    def _generate_cache_key(self, input_data: MultiModalInput) -> str:
        """Generate cache key for input data"""
        import hashlib
        
        # Create hash from input data
        data_str = str(input_data.modality.value) + str(input_data.processing_mode.value)
        if isinstance(input_data.data, str):
            data_str += input_data.data
        elif isinstance(input_data.data, bytes):
            data_str += input_data.data.decode('utf-8', errors='ignore')
        else:
            data_str += str(hash(input_data.data.tobytes()))
            
        return hashlib.md5(data_str.encode()).hexdigest()
        
    async def batch_process(self, inputs: List[MultiModalInput]) -> List[MultiModalOutput]:
        """Process multiple inputs in batch"""
        tasks = [self.process(input_data) for input_data in inputs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        outputs = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logging.error(f"Batch processing failed for input {i}: {str(result)}")
                # Create error output
                error_output = MultiModalOutput(
                    modality=inputs[i].modality,
                    features={"error": str(result)},
                    confidence=0.0
                )
                outputs.append(error_output)
            else:
                outputs.append(result)
                
        return outputs
        
    def get_supported_formats(self) -> List[str]:
        """Get supported input formats"""
        return []  # To be implemented by subclasses
        
    async def validate_input(self, input_data: MultiModalInput) -> bool:
        """Validate input data"""
        if input_data.modality not in self.get_supported_modalities():
            return False
            
        # Additional validation by subclasses
        return await self._validate_input_internal(input_data)
        
    def get_supported_modalities(self) -> List[ModalityType]:
        """Get supported modalities"""
        return []  # To be implemented by subclasses
        
    async def _validate_input_internal(self, input_data: MultiModalInput) -> bool:
        """Internal input validation - to be implemented by subclasses"""
        return True
        
    async def cleanup(self):
        """Cleanup resources"""
        if self.cache:
            self.cache.clear()
        logging.info(f"{self.__class__.__name__} cleanup completed")


class MultiModalMetrics:
    """Metrics collection for multi-modal processing"""
    
    def __init__(self):
        self.processing_times = {}
        self.accuracy_scores = {}
        self.cultural_recognition_rates = {}
        self.error_counts = {}
        
    def record_processing_time(self, modality: ModalityType, time: float):
        """Record processing time for modality"""
        if modality not in self.processing_times:
            self.processing_times[modality] = []
        self.processing_times[modality].append(time)
        
    def record_accuracy(self, modality: ModalityType, accuracy: float):
        """Record accuracy score for modality"""
        if modality not in self.accuracy_scores:
            self.accuracy_scores[modality] = []
        self.accuracy_scores[modality].append(accuracy)
        
    def record_cultural_recognition(self, modality: ModalityType, recognized: bool):
        """Record cultural recognition result"""
        if modality not in self.cultural_recognition_rates:
            self.cultural_recognition_rates[modality] = {"recognized": 0, "total": 0}
        
        self.cultural_recognition_rates[modality]["total"] += 1
        if recognized:
            self.cultural_recognition_rates[modality]["recognized"] += 1
            
    def record_error(self, modality: ModalityType):
        """Record error for modality"""
        if modality not in self.error_counts:
            self.error_counts[modality] = 0
        self.error_counts[modality] += 1
        
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get comprehensive metrics summary"""
        summary = {
            "processing_times": {},
            "accuracy_scores": {},
            "cultural_recognition_rates": {},
            "error_counts": self.error_counts.copy()
        }
        
        # Calculate average processing times
        for modality, times in self.processing_times.items():
            if times:
                summary["processing_times"][modality.value] = {
                    "avg": sum(times) / len(times),
                    "min": min(times),
                    "max": max(times),
                    "count": len(times)
                }
                
        # Calculate average accuracy scores
        for modality, scores in self.accuracy_scores.items():
            if scores:
                summary["accuracy_scores"][modality.value] = {
                    "avg": sum(scores) / len(scores),
                    "min": min(scores),
                    "max": max(scores),
                    "count": len(scores)
                }
                
        # Calculate cultural recognition rates
        for modality, counts in self.cultural_recognition_rates.items():
            if counts["total"] > 0:
                rate = counts["recognized"] / counts["total"]
                summary["cultural_recognition_rates"][modality.value] = {
                    "rate": rate,
                    "recognized": counts["recognized"],
                    "total": counts["total"]
                }
                
        return summary


# Global metrics instance
multimodal_metrics = MultiModalMetrics()