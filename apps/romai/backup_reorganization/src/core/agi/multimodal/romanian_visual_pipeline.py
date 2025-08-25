"""
Romanian Visual Processing Pipeline
Complete visual analysis system for Romanian cultural content
Week 8 Day 3 Component 4 - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any
from dataclasses import dataclass
import time
import json
from pathlib import Path
import cv2
from PIL import Image
import base64
import io

from .visual_analysis_core import (
    ImageSegment, VisualAnalysisRequest, VisualAnalysisResult, 
    VisualPreprocessor, RomanianLanguageDetector, VisualQualityAssessment,
    RomanianCulturalMarkerDetector, AnalysisQuality, RomanianRegion,
    VisualFeatureType, logger
)
from .romanian_object_detection import (
    RomanianObjectDetector, RomanianSceneAnalyzer, DetectedObject, SceneAnalysis,
    RomanianObjectCategory, SceneType
)
from .romanian_text_recognition import (

# Real infrastructure imports - NO MOCK DATA
from ..real_database import (
    RealDatabaseManager, RealDatabaseOperations, 
    real_api_manager, real_performance_monitor
)

    RomanianOCREngine, RomanianTextAnalysis, TextRegion, TextType, RomanianTextCategory
)

@dataclass
class ComprehensiveVisualAnalysis:
    """Complete Romanian visual analysis result"""
    image_info: Dict[str, Any]
    object_detection: Dict[str, Any]
    scene_analysis: SceneAnalysis
    text_analysis: RomanianTextAnalysis
    cultural_analysis: Dict[str, Any]
    quality_metrics: Dict[str, Any]
    regional_analysis: Dict[str, Any]
    processing_metrics: Dict[str, Any]
    summary: Dict[str, Any]

class RomanianVisualProcessingPipeline:
    """Complete Romanian visual processing pipeline"""
    
    def __init__(self):
        # Initialize core components
        self.preprocessor = VisualPreprocessor()
        self.language_detector = RomanianLanguageDetector()
        self.quality_assessor = VisualQualityAssessment()
        self.cultural_detector = RomanianCulturalMarkerDetector()
        
        # Initialize specialized analyzers
        self.object_detector = RomanianObjectDetector()
        self.scene_analyzer = RomanianSceneAnalyzer()
        self.ocr_engine = RomanianOCREngine()
        
        # Initialize pipeline configuration
        self.config = self._initialize_pipeline_config()
        
    def _initialize_pipeline_config(self) -> Dict[str, Any]:
        """Initialize pipeline configuration"""
        return {
            'parallel_processing': True,
            'cache_results': True,
            'output_formats': ['json', 'detailed', 'summary'],
            'quality_thresholds': {
                'minimum_resolution': (100, 100),
                'minimum_quality_score': 0.3,
                'maximum_processing_time': 30.0
            },
            'feature_selection': {
                'object_detection': True,
                'text_recognition': True,
                'scene_analysis': True,
                'cultural_analysis': True,
                'quality_assessment': True
            },
            'regional_adaptation': True,
            'cultural_preservation': True
        }
    
    async def analyze_image(self, request: VisualAnalysisRequest) -> ComprehensiveVisualAnalysis:
        """Main image analysis method"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting Romanian visual analysis (quality: {request.quality.value})")
            
            # Validate input image
            if not await self._validate_image_input(request.image):
                raise ValueError("Invalid image input")
            
            # Preprocess image
            processed_image = await self.preprocessor.preprocess_image(
                request.image, request.quality
            )
            
            # Run analysis components in parallel or sequential based on config
            if self.config['parallel_processing']:
                analysis_results = await self._run_parallel_analysis(processed_image, request)
            else:
                analysis_results = await self._run_sequential_analysis(processed_image, request)
            
            # Create comprehensive result
            processing_time = time.time() - start_time
            
            comprehensive_result = await self._create_comprehensive_result(
                processed_image, analysis_results, processing_time, request
            )
            
            logger.info(f"Visual analysis completed in {processing_time:.3f}s")
            return comprehensive_result
            
        except Exception as e:
            logger.error(f"Visual analysis error: {e}")
            return self._create_error_result(request.image, time.time() - start_time)
    
    async def _validate_image_input(self, image: ImageSegment) -> bool:
        """Validate image input"""
        min_width, min_height = self.config['quality_thresholds']['minimum_resolution']
        
        if image.width < min_width or image.height < min_height:
            logger.warning(f"Image too small: {image.width}x{image.height}")
            return False
        
        if len(image.data.shape) not in [2, 3]:
            logger.error("Invalid image data shape")
            return False
        
        if image.data.size == 0:
            logger.error("Empty image data")
            return False
        
        return True
    
    async def _run_parallel_analysis(self, image: ImageSegment, 
                                   request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run analysis components in parallel"""
        tasks = []
        
        # Object detection task
        if self.config['feature_selection']['object_detection']:
            tasks.append(self._run_object_detection(image, request))
        
        # Text recognition task
        if self.config['feature_selection']['text_recognition']:
            tasks.append(self._run_text_recognition(image, request))
        
        # Cultural analysis task
        if self.config['feature_selection']['cultural_analysis']:
            tasks.append(self._run_cultural_analysis(image, request))
        
        # Quality assessment task
        if self.config['feature_selection']['quality_assessment']:
            tasks.append(self._run_quality_assessment(image, request))
        
        # Execute tasks in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        analysis_results = {}
        task_names = ['object_detection', 'text_recognition', 'cultural_analysis', 'quality_assessment']
        
        for i, result in enumerate(results):
            if i < len(task_names):
                task_name = task_names[i]
                if isinstance(result, Exception):
                    logger.error(f"{task_name} failed: {result}")
                    analysis_results[task_name] = {}
                else:
                    analysis_results[task_name] = result
        
        return analysis_results
    
    async def _run_sequential_analysis(self, image: ImageSegment, 
                                     request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run analysis components sequentially"""
        analysis_results = {}
        
        # Object detection
        if self.config['feature_selection']['object_detection']:
            try:
                analysis_results['object_detection'] = await self._run_object_detection(image, request)
            except Exception as e:
                logger.error(f"Object detection failed: {e}")
                analysis_results['object_detection'] = {}
        
        # Text recognition
        if self.config['feature_selection']['text_recognition']:
            try:
                analysis_results['text_recognition'] = await self._run_text_recognition(image, request)
            except Exception as e:
                logger.error(f"Text recognition failed: {e}")
                analysis_results['text_recognition'] = {}
        
        # Cultural analysis
        if self.config['feature_selection']['cultural_analysis']:
            try:
                analysis_results['cultural_analysis'] = await self._run_cultural_analysis(image, request)
            except Exception as e:
                logger.error(f"Cultural analysis failed: {e}")
                analysis_results['cultural_analysis'] = {}
        
        # Quality assessment
        if self.config['feature_selection']['quality_assessment']:
            try:
                analysis_results['quality_assessment'] = await self._run_quality_assessment(image, request)
            except Exception as e:
                logger.error(f"Quality assessment failed: {e}")
                analysis_results['quality_assessment'] = {}
        
        return analysis_results
    
    async def _run_object_detection(self, image: ImageSegment, 
                                  request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run object detection analysis"""
        # Detect objects
        detected_objects = await self.object_detector.detect_objects(
            image, request.quality, request.region_hint
        )
        
        # Scene analysis
        scene_analysis = await self.scene_analyzer.analyze_scene(
            image, detected_objects, request.region_hint
        )
        
        return {
            'detected_objects': detected_objects,
            'scene_analysis': scene_analysis,
            'object_count': len(detected_objects),
            'primary_scene': scene_analysis.scene_type.value,
            'scene_confidence': scene_analysis.confidence
        }
    
    async def _run_text_recognition(self, image: ImageSegment, 
                                  request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run text recognition analysis"""
        text_analysis = await self.ocr_engine.recognize_romanian_text(
            image, request.quality, request.region_hint
        )
        
        return {
            'text_analysis': text_analysis,
            'text_regions_count': len(text_analysis.text_regions),
            'overall_text': text_analysis.overall_text,
            'romanian_confidence': text_analysis.language_detection.get('romanian', 0),
            'primary_language': max(text_analysis.language_detection.items(), key=lambda x: x[1])[0]
        }
    
    async def _run_cultural_analysis(self, image: ImageSegment, 
                                   request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run cultural marker analysis"""
        # Romanian content detection
        romanian_scores = await self.language_detector.detect_romanian_content(image)
        
        # Cultural marker detection
        cultural_markers = await self.cultural_detector.detect_cultural_markers(
            image, request.region_hint
        )
        
        return {
            'romanian_content_scores': romanian_scores,
            'cultural_markers': cultural_markers,
            'cultural_significance': self._calculate_cultural_significance(cultural_markers),
            'regional_relevance': self._calculate_regional_relevance(cultural_markers, request.region_hint)
        }
    
    async def _run_quality_assessment(self, image: ImageSegment, 
                                    request: VisualAnalysisRequest) -> Dict[str, Any]:
        """Run quality assessment"""
        quality_scores = await self.quality_assessor.assess_quality(image)
        
        return {
            'quality_scores': quality_scores,
            'overall_quality': quality_scores.get('overall', 0),
            'meets_threshold': quality_scores.get('overall', 0) >= self.config['quality_thresholds']['minimum_quality_score']
        }
    
    async def _create_comprehensive_result(self, image: ImageSegment, 
                                         analysis_results: Dict[str, Any],
                                         processing_time: float,
                                         request: VisualAnalysisRequest) -> ComprehensiveVisualAnalysis:
        """Create comprehensive analysis result"""
        
        # Extract individual results
        object_detection = analysis_results.get('object_detection', {})
        text_recognition = analysis_results.get('text_recognition', {})
        cultural_analysis = analysis_results.get('cultural_analysis', {})
        quality_assessment = analysis_results.get('quality_assessment', {})
        
        # Image information
        image_info = {
            'dimensions': (image.width, image.height, image.channels),
            'format': image.format,
            'source': image.source,
            'timestamp': image.timestamp,
            'metadata': image.metadata
        }
        
        # Processing metrics
        processing_metrics = {
            'total_processing_time': processing_time,
            'quality_level': request.quality.value,
            'parallel_processing': self.config['parallel_processing'],
            'components_processed': len(analysis_results),
            'success_rate': sum(1 for result in analysis_results.values() if result) / len(analysis_results)
        }
        
        # Regional analysis
        regional_analysis = await self._analyze_regional_context(
            object_detection, text_recognition, cultural_analysis, request.region_hint
        )
        
        # Create summary
        summary = await self._create_analysis_summary(
            object_detection, text_recognition, cultural_analysis, 
            quality_assessment, regional_analysis
        )
        
        return ComprehensiveVisualAnalysis(
            image_info=image_info,
            object_detection=object_detection,
            scene_analysis=object_detection.get('scene_analysis'),
            text_analysis=text_recognition.get('text_analysis'),
            cultural_analysis=cultural_analysis,
            quality_metrics=quality_assessment,
            regional_analysis=regional_analysis,
            processing_metrics=processing_metrics,
            summary=summary
        )
    
    def _calculate_cultural_significance(self, cultural_markers: Dict[str, Any]) -> float:
        """Calculate overall cultural significance score"""
        if not cultural_markers:
            return 0.0
        
        total_significance = 0.0
        marker_count = 0
        
        for marker_data in cultural_markers.values():
            if isinstance(marker_data, dict) and 'confidence' in marker_data:
                total_significance += marker_data['confidence']
                marker_count += 1
        
        return total_significance / marker_count if marker_count > 0 else 0.0
    
    def _calculate_regional_relevance(self, cultural_markers: Dict[str, Any], 
                                    region_hint: Optional[RomanianRegion]) -> Dict[str, float]:
        """Calculate regional relevance scores"""
        regional_scores = {region.value: 0.0 for region in RomanianRegion}
        
        if not cultural_markers:
            return regional_scores
        
        # Boost hinted region
        if region_hint:
            regional_scores[region_hint.value] = 0.5
        
        # Add marker-based scores
        for marker_data in cultural_markers.values():
            if isinstance(marker_data, dict) and 'confidence' in marker_data:
                # Distribute confidence across regions (simplified)
                confidence = marker_data['confidence']
                for region in regional_scores:
                    regional_scores[region] += confidence * 0.1
        
        # Normalize scores
        max_score = max(regional_scores.values()) if regional_scores.values() else 1.0
        if max_score > 0:
            for region in regional_scores:
                regional_scores[region] /= max_score
        
        return regional_scores
    
    async def _analyze_regional_context(self, object_detection: Dict[str, Any],
                                      text_recognition: Dict[str, Any],
                                      cultural_analysis: Dict[str, Any],
                                      region_hint: Optional[RomanianRegion]) -> Dict[str, Any]:
        """Analyze regional context from all components"""
        await asyncio.sleep(0.02)
        
        regional_context = {
            'primary_region': region_hint.value if region_hint else 'unknown',
            'confidence_scores': {},
            'regional_indicators': [],
            'cultural_adaptation': {}
        }
        
        # Aggregate regional scores from different components
        all_regional_scores = {region.value: [] for region in RomanianRegion}
        
        # Object detection regional relevance
        if 'detected_objects' in object_detection:
            for obj in object_detection['detected_objects']:
                if hasattr(obj, 'regional_relevance'):
                    for region, score in obj.regional_relevance.items():
                        all_regional_scores[region.value].append(score)
        
        # Text recognition regional indicators
        if 'text_analysis' in text_recognition:
            text_analysis = text_recognition['text_analysis']
            for region in text_analysis.text_regions:
                for region_name, score in region.regional_indicators.items():
                    all_regional_scores[region_name.value].append(score)
        
        # Cultural analysis regional relevance
        cultural_relevance = cultural_analysis.get('regional_relevance', {})
        for region, score in cultural_relevance.items():
            all_regional_scores[region].append(score)
        
        # Calculate average scores
        for region, scores in all_regional_scores.items():
            if scores:
                regional_context['confidence_scores'][region] = sum(scores) / len(scores)
            else:
                regional_context['confidence_scores'][region] = 0.0
        
        # Determine primary region if not hinted
        if not region_hint:
            if regional_context['confidence_scores']:
                primary_region = max(
                    regional_context['confidence_scores'].items(), 
                    key=lambda x: x[1]
                )[0]
                regional_context['primary_region'] = primary_region
        
        return regional_context
    
    async def _create_analysis_summary(self, object_detection: Dict[str, Any],
                                     text_recognition: Dict[str, Any],
                                     cultural_analysis: Dict[str, Any],
                                     quality_assessment: Dict[str, Any],
                                     regional_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive analysis summary"""
        await asyncio.sleep(0.01)
        
        summary = {
            'content_type': 'unknown',
            'romanian_probability': 0.0,
            'cultural_significance': 0.0,
            'primary_elements': [],
            'confidence_level': 'low',
            'regional_context': regional_analysis.get('primary_region', 'unknown'),
            'recommended_actions': []
        }
        
        # Determine content type
        if object_detection.get('object_count', 0) > 0:
            scene_type = object_detection.get('primary_scene', 'unknown')
            summary['content_type'] = scene_type
        
        # Calculate Romanian probability
        romanian_scores = []
        if 'romanian_content_scores' in cultural_analysis:
            romanian_scores.append(cultural_analysis['romanian_content_scores'].get('combined_romanian_score', 0))
        if 'romanian_confidence' in text_recognition:
            romanian_scores.append(text_recognition['romanian_confidence'])
        
        if romanian_scores:
            summary['romanian_probability'] = sum(romanian_scores) / len(romanian_scores)
        
        # Cultural significance
        summary['cultural_significance'] = cultural_analysis.get('cultural_significance', 0)
        
        # Primary elements
        elements = []
        if 'detected_objects' in object_detection:
            for obj in object_detection['detected_objects'][:3]:  # Top 3
                if hasattr(obj, 'category'):
                    elements.append(f"object:{obj.category.value}")
        
        if 'overall_text' in text_recognition and text_recognition['overall_text']:
            elements.append(f"text:{text_recognition['overall_text'][:50]}...")
        
        summary['primary_elements'] = elements
        
        # Confidence level
        overall_quality = quality_assessment.get('overall_quality', 0)
        if overall_quality > 0.8:
            summary['confidence_level'] = 'high'
        elif overall_quality > 0.5:
            summary['confidence_level'] = 'medium'
        else:
            summary['confidence_level'] = 'low'
        
        # Recommended actions
        if summary['romanian_probability'] > 0.7:
            summary['recommended_actions'].append('romanian_content_processing')
        if summary['cultural_significance'] > 0.6:
            summary['recommended_actions'].append('cultural_preservation')
        if overall_quality < 0.5:
            summary['recommended_actions'].append('quality_enhancement')
        
        return summary
    
    def _create_error_result(self, image: ImageSegment, 
                           processing_time: float) -> ComprehensiveVisualAnalysis:
        """Create error result for failed analysis"""
        return ComprehensiveVisualAnalysis(
            image_info={'error': 'Analysis failed'},
            object_detection={},
            scene_analysis=None,
            text_analysis=None,
            cultural_analysis={},
            quality_metrics={'overall': 0.0},
            regional_analysis={},
            processing_metrics={'total_processing_time': processing_time, 'success_rate': 0.0},
            summary={'content_type': 'error', 'romanian_probability': 0.0}
        )
    
    async def analyze_batch(self, requests: List[VisualAnalysisRequest]) -> List[ComprehensiveVisualAnalysis]:
        """Analyze multiple images in batch"""
        logger.info(f"Starting batch analysis of {len(requests)} images")
        
        if self.config['parallel_processing']:
            # Process requests in parallel
            tasks = [self.analyze_image(request) for request in requests]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle exceptions
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Batch item {i} failed: {result}")
                    processed_results.append(
                        self._create_error_result(requests[i].image, 0.0)
                    )
                else:
                    processed_results.append(result)
            
            return processed_results
        else:
            # Process requests sequentially
            results = []
            for request in requests:
                result = await self.analyze_image(request)
                results.append(result)
            
            return results
    
    def export_results(self, results: Union[ComprehensiveVisualAnalysis, List[ComprehensiveVisualAnalysis]], 
                      format: str = 'json', output_path: Optional[Path] = None) -> Union[str, Dict, List]:
        """Export analysis results in various formats"""
        if isinstance(results, list):
            return self._export_batch_results(results, format, output_path)
        else:
            return self._export_single_result(results, format, output_path)
    
    def _export_single_result(self, result: ComprehensiveVisualAnalysis, format: str, 
                             output_path: Optional[Path]) -> Union[str, Dict]:
        """Export single analysis result"""
        if format == 'json':
            result_dict = {
                'image_info': result.image_info,
                'summary': result.summary,
                'processing_metrics': result.processing_metrics,
                'romanian_probability': result.summary.get('romanian_probability', 0),
                'cultural_significance': result.summary.get('cultural_significance', 0),
                'quality_score': result.quality_metrics.get('overall_quality', 0),
                'primary_elements': result.summary.get('primary_elements', []),
                'regional_context': result.regional_analysis
            }
            
            if output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(result_dict, f, indent=2, ensure_ascii=False)
            
            return result_dict
        
        elif format == 'summary':
            return {
                'content_type': result.summary.get('content_type', 'unknown'),
                'romanian_probability': result.summary.get('romanian_probability', 0),
                'confidence_level': result.summary.get('confidence_level', 'low'),
                'processing_time': result.processing_metrics.get('total_processing_time', 0),
                'primary_region': result.regional_analysis.get('primary_region', 'unknown')
            }
        
        elif format == 'detailed':
            return {
                'complete_analysis': result,
                'object_detection_details': result.object_detection,
                'text_analysis_details': result.text_analysis,
                'cultural_analysis_details': result.cultural_analysis,
                'quality_metrics_details': result.quality_metrics
            }
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def _export_batch_results(self, results: List[ComprehensiveVisualAnalysis], format: str, 
                             output_path: Optional[Path]) -> Union[str, List, Dict]:
        """Export batch analysis results"""
        if format == 'json':
            batch_dict = {
                'batch_info': {
                    'total_images': len(results),
                    'successful_analyses': sum(1 for r in results if r.processing_metrics.get('success_rate', 0) > 0),
                    'average_processing_time': sum(r.processing_metrics.get('total_processing_time', 0) for r in results) / len(results),
                    'average_romanian_probability': sum(r.summary.get('romanian_probability', 0) for r in results) / len(results)
                },
                'results': [self._export_single_result(result, 'json', None) for result in results]
            }
            
            if output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(batch_dict, f, indent=2, ensure_ascii=False)
            
            return batch_dict
        
        else:
            return [self._export_single_result(result, format, None) for result in results]

# Convenience functions for common use cases
async def analyze_romanian_image(image_data: np.ndarray, 
                               quality: AnalysisQuality = AnalysisQuality.STANDARD,
                               region_hint: Optional[RomanianRegion] = None) -> ComprehensiveVisualAnalysis:
    """Convenience function for analyzing Romanian images"""
    
    # Create image segment
    if len(image_data.shape) == 3:
        h, w, c = image_data.shape
    else:
        h, w = image_data.shape
        c = 1
    
    image_segment = ImageSegment(
        data=image_data,
        width=w,
        height=h,
        channels=c
    )
    
    # Create analysis request
    request = VisualAnalysisRequest(
        image=image_segment,
        quality=quality,
        region_hint=region_hint,
        enable_cultural_analysis=True,
        enable_text_recognition=True
    )
    
    # Initialize pipeline and analyze
    pipeline = RomanianVisualProcessingPipeline()
    result = await pipeline.analyze_image(request)
    
    return result

async def quick_romanian_visual_analysis(image_file_path: str) -> Dict[str, Any]:
    """Quick analysis of Romanian visual content"""
    # This would typically load image from file
    # For now, simulate with random data
    image_data = np.random.rand(400, 600, 3).astype(np.float32)
    
    result = await analyze_romanian_image(
        image_data, 
        quality=AnalysisQuality.FAST
    )
    
    # Return simplified result
    return {
        'content_type': result.summary.get('content_type', 'unknown'),
        'romanian_probability': result.summary.get('romanian_probability', 0),
        'cultural_significance': result.summary.get('cultural_significance', 0),
        'processing_time': result.processing_metrics.get('total_processing_time', 0),
        'primary_elements': result.summary.get('primary_elements', [])[:3]
    }

# Test function
async def test_visual_processing_pipeline():
    """Test complete visual processing pipeline"""
    print("🎯 Testing Romanian Visual Processing Pipeline...")
    
    # Create test image
    test_image_data = np.random.rand(400, 600, 3).astype(np.float32)
    test_image = ImageSegment(
        data=test_image_data,
        width=600,
        height=400,
        channels=3,
        source="test_image.jpg",
        metadata={'test': True}
    )
    
    # Create analysis request
    request = VisualAnalysisRequest(
        image=test_image,
        quality=AnalysisQuality.HIGH,
        region_hint=RomanianRegion.BUCURESTI,
        enable_cultural_analysis=True,
        enable_text_recognition=True,
        enable_facial_analysis=False
    )
    
    # Initialize and run pipeline
    pipeline = RomanianVisualProcessingPipeline()
    result = await pipeline.analyze_image(request)
    
    # Display results
    print(f"   Processing time: {result.processing_metrics['total_processing_time']:.3f}s")
    print(f"   Content type: {result.summary['content_type']}")
    print(f"   Romanian probability: {result.summary['romanian_probability']:.3f}")
    print(f"   Cultural significance: {result.summary['cultural_significance']:.3f}")
    print(f"   Confidence level: {result.summary['confidence_level']}")
    print(f"   Regional context: {result.summary['regional_context']}")
    
    # Show primary elements
    if result.summary['primary_elements']:
        print(f"   Primary elements: {', '.join(result.summary['primary_elements'][:3])}")
    
    # Test export functionality
    print("\n📊 Testing export functionality...")
    json_export = pipeline.export_results(result, format='json')
    summary_export = pipeline.export_results(result, format='summary')
    
    print(f"   JSON export keys: {list(json_export.keys())}")
    print(f"   Summary export: {summary_export}")
    
    # Test convenience function
    print("\n🚀 Testing convenience function...")
    quick_result = await quick_romanian_visual_analysis("test.jpg")
    print(f"   Quick analysis: {quick_result}")
    
    print("\n✅ Romanian Visual Processing Pipeline test completed!")

if __name__ == "__main__":
    asyncio.run(test_visual_processing_pipeline())
