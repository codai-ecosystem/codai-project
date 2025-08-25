"""
Enhanced Multimodal Expert

Integrates state-of-the-art vision-language models with advanced multimodal
processing capabilities for RomAI's comprehensive multimodal intelligence.

This expert combines:
- LLaVA for advanced vision-language understanding
- CLIP for image-text alignment and similarity
- Whisper for audio transcription and analysis
- Custom Romanian cultural vision analysis
- DeepSeek V3 integration for optimal performance
"""

import os
import time
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
import torch
import numpy as np
from PIL import Image

from ..multimodal.vision_language_model import (
    AdvancedVisionLanguageModel,
    MultimodalInput,
    MultimodalOutput,
    MultimodalTask,
    VisionLanguageArchitecture
)

logger = logging.getLogger(__name__)


class EnhancedMultimodalExpert:
    """
    Enhanced multimodal expert combining multiple vision-language architectures
    with DeepSeek V3 integration for comprehensive multimodal AI capabilities.
    """
    
    def __init__(self, model_config: Dict[str, Any] = None):
        """Initialize the enhanced multimodal expert."""
        self.config = model_config or {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize the advanced vision-language model
        self.vlm = AdvancedVisionLanguageModel(self.config)
        
        # Track expert readiness
        self.is_ready = self._check_readiness()
        
        # Romanian cultural context support
        self.romanian_context_enabled = True
        
        # Performance metrics
        self.processed_requests = 0
        self.total_processing_time = 0.0
        self.success_rate = 0.0
        
        logger.info(f"Enhanced Multimodal Expert initialized. Ready: {self.is_ready}")
        logger.info(f"Available models: {self.vlm.available_models}")
    
    def _check_readiness(self) -> bool:
        """Check if the expert is ready for processing."""
        # Expert is ready if at least one model is available
        return any(self.vlm.available_models.values())
    
    def process_multimodal_request(
        self, 
        query: str,
        image_path: Optional[str] = None,
        video_path: Optional[str] = None,
        audio_path: Optional[str] = None,
        task_type: str = "general",
        romanian_context: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process multimodal request with comprehensive capabilities.
        
        Args:
            query: Text query or instruction
            image_path: Path to image file
            video_path: Path to video file
            audio_path: Path to audio file
            task_type: Type of task to perform
            romanian_context: Whether to include Romanian cultural context
            **kwargs: Additional parameters
        
        Returns:
            Comprehensive multimodal response
        """
        
        start_time = time.time()
        
        if not self.is_ready:
            return {
                'success': False,
                'response': 'Multimodal expert not ready. Please check model availability.',
                'error': 'Expert not initialized properly',
                'confidence': 0.1,
                'processing_time': 0.0
            }
        
        try:
            # Map task type to MultimodalTask enum
            task_mapping = {
                'caption': MultimodalTask.IMAGE_CAPTIONING,
                'captioning': MultimodalTask.IMAGE_CAPTIONING,
                'image_caption': MultimodalTask.IMAGE_CAPTIONING,
                'visual_qa': MultimodalTask.VISUAL_QUESTION_ANSWERING,
                'vqa': MultimodalTask.VISUAL_QUESTION_ANSWERING,
                'question_answer': MultimodalTask.VISUAL_QUESTION_ANSWERING,
                'match': MultimodalTask.IMAGE_TEXT_MATCHING,
                'matching': MultimodalTask.IMAGE_TEXT_MATCHING,
                'similarity': MultimodalTask.IMAGE_TEXT_MATCHING,
                'detect': MultimodalTask.OBJECT_DETECTION,
                'detection': MultimodalTask.OBJECT_DETECTION,
                'objects': MultimodalTask.OBJECT_DETECTION,
                'scene': MultimodalTask.SCENE_UNDERSTANDING,
                'scene_understanding': MultimodalTask.SCENE_UNDERSTANDING,
                'analyze_scene': MultimodalTask.SCENE_UNDERSTANDING,
                'video': MultimodalTask.VIDEO_UNDERSTANDING,
                'video_analysis': MultimodalTask.VIDEO_UNDERSTANDING,
                'video_understanding': MultimodalTask.VIDEO_UNDERSTANDING,
                'audio_video': MultimodalTask.AUDIO_VISUAL_SYNC,
                'sync': MultimodalTask.AUDIO_VISUAL_SYNC,
                'romanian': MultimodalTask.ROMANIAN_CULTURAL_ANALYSIS,
                'cultural': MultimodalTask.ROMANIAN_CULTURAL_ANALYSIS,
                'romanian_culture': MultimodalTask.ROMANIAN_CULTURAL_ANALYSIS,
                'general': MultimodalTask.IMAGE_CAPTIONING
            }
            
            task = task_mapping.get(task_type.lower(), MultimodalTask.IMAGE_CAPTIONING)
            
            # Load image if provided
            image = None
            if image_path:
                try:
                    if isinstance(image_path, str) and os.path.exists(image_path):
                        image = Image.open(image_path)
                    elif isinstance(image_path, str) and image_path.startswith(('http://', 'https://')):
                        import requests
                        response = requests.get(image_path)
                        from io import BytesIO
                        image = Image.open(BytesIO(response.content))
                    elif isinstance(image_path, (Image.Image, np.ndarray)):
                        image = image_path
                except Exception as e:
                    logger.error(f"Failed to load image: {e}")
                    image = None
            
            # Create multimodal input
            multimodal_input = MultimodalInput(
                image=image,
                video=video_path,
                audio=audio_path,
                text=query,
                task=task,
                context=kwargs.get('context'),
                romanian_context=romanian_context,
                parameters=kwargs
            )
            
            # Process with advanced vision-language model
            result = self.vlm.process_multimodal_input(multimodal_input)
            
            # Update performance metrics
            self.processed_requests += 1
            processing_time = time.time() - start_time
            self.total_processing_time += processing_time
            
            # Calculate success rate
            success = result.confidence > 0.5
            if self.processed_requests > 0:
                current_success_rate = (self.success_rate * (self.processed_requests - 1) + (1 if success else 0)) / self.processed_requests
                self.success_rate = current_success_rate
            
            # Format comprehensive response
            response_data = {
                'success': success,
                'response': result.text_response,
                'confidence': result.confidence,
                'processing_time': result.processing_time,
                'model_used': result.model_used,
                'task_type': task.value,
                'multimodal_details': {
                    'image_provided': image is not None,
                    'video_provided': video_path is not None,
                    'audio_provided': audio_path is not None,
                    'text_provided': bool(query),
                    'romanian_context': romanian_context
                }
            }
            
            # Add additional details if available
            if result.detected_objects:
                response_data['detected_objects'] = result.detected_objects
            
            if result.scene_analysis:
                response_data['scene_analysis'] = result.scene_analysis
            
            if result.audio_transcription:
                response_data['audio_transcription'] = result.audio_transcription
            
            if result.cross_modal_alignment is not None:
                response_data['cross_modal_alignment'] = result.cross_modal_alignment
            
            if result.romanian_cultural_insights:
                response_data['romanian_cultural_insights'] = result.romanian_cultural_insights
            
            if result.generated_image:
                response_data['generated_image'] = result.generated_image
            
            return response_data
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Multimodal processing failed: {e}")
            
            return {
                'success': False,
                'response': f'Multimodal processing encountered an error: {str(e)}',
                'error': str(e),
                'confidence': 0.1,
                'processing_time': processing_time,
                'task_type': task_type
            }
    
    def caption_image(
        self, 
        image_path: str, 
        prompt: Optional[str] = None,
        romanian_context: bool = False
    ) -> Dict[str, Any]:
        """Generate caption for an image."""
        
        return self.process_multimodal_request(
            query=prompt or "Describe this image in detail.",
            image_path=image_path,
            task_type="image_caption",
            romanian_context=romanian_context
        )
    
    def answer_visual_question(
        self, 
        image_path: str, 
        question: str,
        romanian_context: bool = False
    ) -> Dict[str, Any]:
        """Answer a question about an image."""
        
        return self.process_multimodal_request(
            query=question,
            image_path=image_path,
            task_type="visual_qa",
            romanian_context=romanian_context
        )
    
    def analyze_image_text_similarity(
        self, 
        image_path: str, 
        text: str
    ) -> Dict[str, Any]:
        """Analyze similarity between image and text."""
        
        return self.process_multimodal_request(
            query=text,
            image_path=image_path,
            task_type="matching"
        )
    
    def detect_objects(
        self, 
        image_path: str,
        romanian_context: bool = False
    ) -> Dict[str, Any]:
        """Detect objects in an image."""
        
        return self.process_multimodal_request(
            query="Detect and list all objects in this image.",
            image_path=image_path,
            task_type="detection",
            romanian_context=romanian_context
        )
    
    def understand_scene(
        self, 
        image_path: str,
        romanian_context: bool = False
    ) -> Dict[str, Any]:
        """Understand and analyze a scene."""
        
        return self.process_multimodal_request(
            query="Analyze this scene: describe the setting, environment, and context.",
            image_path=image_path,
            task_type="scene_understanding",
            romanian_context=romanian_context
        )
    
    def analyze_video(
        self, 
        video_path: str, 
        query: Optional[str] = None,
        romanian_context: bool = False
    ) -> Dict[str, Any]:
        """Analyze video content."""
        
        return self.process_multimodal_request(
            query=query or "Analyze this video and describe what happens.",
            video_path=video_path,
            task_type="video_understanding",
            romanian_context=romanian_context
        )
    
    def analyze_audio_visual_sync(
        self, 
        video_path: str
    ) -> Dict[str, Any]:
        """Analyze audio-visual synchronization in video."""
        
        return self.process_multimodal_request(
            query="Analyze audio-visual synchronization.",
            video_path=video_path,
            task_type="audio_video"
        )
    
    def analyze_romanian_cultural_content(
        self, 
        image_path: str, 
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze Romanian cultural elements in an image."""
        
        return self.process_multimodal_request(
            query=context or "Analyze Romanian cultural elements in this image.",
            image_path=image_path,
            task_type="romanian_culture",
            romanian_context=True
        )
    
    def get_expert_capabilities(self) -> Dict[str, Any]:
        """Get information about expert capabilities."""
        
        capabilities = self.vlm.get_model_capabilities()
        
        return {
            'expert_ready': self.is_ready,
            'processed_requests': self.processed_requests,
            'average_processing_time': self.total_processing_time / max(self.processed_requests, 1),
            'success_rate': self.success_rate,
            'romanian_context_support': self.romanian_context_enabled,
            'device': str(self.device),
            'model_capabilities': capabilities,
            'supported_tasks': [
                'image_captioning',
                'visual_question_answering',
                'image_text_matching',
                'object_detection',
                'scene_understanding',
                'video_understanding',
                'audio_visual_sync',
                'romanian_cultural_analysis'
            ],
            'input_formats': {
                'images': ['PIL.Image', 'file_path', 'url', 'numpy_array'],
                'videos': ['file_path', 'numpy_array'],
                'audio': ['file_path', 'numpy_array'],
                'text': ['string']
            }
        }
    
    def benchmark_performance(self, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Benchmark expert performance on test cases."""
        
        results = {
            'total_cases': len(test_cases),
            'successful_cases': 0,
            'failed_cases': 0,
            'average_confidence': 0.0,
            'average_processing_time': 0.0,
            'task_performance': {},
            'model_usage': {}
        }
        
        confidences = []
        processing_times = []
        
        for i, test_case in enumerate(test_cases):
            logger.info(f"Processing benchmark case {i+1}/{len(test_cases)}")
            
            try:
                result = self.process_multimodal_request(**test_case)
                
                if result['success']:
                    results['successful_cases'] += 1
                    confidences.append(result['confidence'])
                    processing_times.append(result['processing_time'])
                    
                    # Track task performance
                    task_type = result.get('task_type', 'unknown')
                    if task_type not in results['task_performance']:
                        results['task_performance'][task_type] = {'count': 0, 'success': 0}
                    results['task_performance'][task_type]['count'] += 1
                    results['task_performance'][task_type]['success'] += 1
                    
                    # Track model usage
                    model_used = result.get('model_used', 'unknown')
                    results['model_usage'][model_used] = results['model_usage'].get(model_used, 0) + 1
                else:
                    results['failed_cases'] += 1
                    
            except Exception as e:
                logger.error(f"Benchmark case {i+1} failed: {e}")
                results['failed_cases'] += 1
        
        # Calculate averages
        if confidences:
            results['average_confidence'] = sum(confidences) / len(confidences)
        if processing_times:
            results['average_processing_time'] = sum(processing_times) / len(processing_times)
        
        # Calculate success rate
        results['success_rate'] = results['successful_cases'] / results['total_cases'] if results['total_cases'] > 0 else 0.0
        
        return results


# Create alias for backward compatibility with existing imports
MultimodalExpert = EnhancedMultimodalExpert
MultimodalProcessingExpert = EnhancedMultimodalExpert


def create_multimodal_expert(config: Dict[str, Any] = None) -> EnhancedMultimodalExpert:
    """Factory function to create a multimodal expert."""
    return EnhancedMultimodalExpert(config)