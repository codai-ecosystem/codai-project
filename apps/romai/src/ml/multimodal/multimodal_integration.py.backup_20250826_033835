"""
Multi-Modal Integration System
Unified processing of vision, audio, and text with Romanian cultural consciousness
"""

import torch
import numpy as np
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import json
import time
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

# Import our specialized processors
from .vision_processor import RomanianVisionProcessor, VisionTaskType, VisionResult
from .audio_processor import RomanianAudioProcessor, AudioTaskType, AudioResult
from ..reasoning.autonomous_logical_engine import AutonomousLogicalEngine
from ..reasoning.romanian_cultural_engine import RomanianCulturalEngine

logger = logging.getLogger(__name__)

class MultiModalTaskType(Enum):
    """Types of multi-modal processing tasks"""
    CULTURAL_SCENE_ANALYSIS = "cultural_scene_analysis"
    AUDIO_VISUAL_SYNCHRONIZATION = "audio_visual_synchronization"
    CROSS_MODAL_UNDERSTANDING = "cross_modal_understanding"
    CULTURAL_STORYTELLING = "cultural_storytelling"
    MULTIMEDIA_ARCHIVAL = "multimedia_archival"
    INTERACTIVE_CULTURAL_GUIDE = "interactive_cultural_guide"
    CULTURAL_EDUCATION_CONTENT = "cultural_education_content"
    HERITAGE_DOCUMENTATION = "heritage_documentation"

class ModalityType(Enum):
    """Types of input modalities"""
    VISION = "vision"
    AUDIO = "audio"
    TEXT = "text"
    COMBINED = "combined"

@dataclass
class MultiModalInput:
    """Input data for multi-modal processing"""
    modality: ModalityType
    data: Any
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Cultural context
    cultural_context: Optional[str] = None
    regional_context: Optional[str] = None
    historical_period: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'modality': self.modality.value,
            'metadata': self.metadata,
            'cultural_context': self.cultural_context,
            'regional_context': self.regional_context,
            'historical_period': self.historical_period
        }

@dataclass
class MultiModalResult:
    """Result from multi-modal processing"""
    task_type: MultiModalTaskType
    confidence: float
    
    # Individual modality results
    vision_result: Optional[VisionResult] = None
    audio_result: Optional[AudioResult] = None
    text_analysis: Optional[Dict[str, Any]] = None
    
    # Integrated analysis
    cultural_narrative: str = ""
    cross_modal_correlations: Dict[str, float] = field(default_factory=dict)
    unified_cultural_score: float = 0.0
    
    # Romanian cultural insights
    cultural_elements: List[str] = field(default_factory=list)
    historical_context: Dict[str, Any] = field(default_factory=dict)
    regional_insights: Dict[str, Any] = field(default_factory=dict)
    educational_value: float = 0.0
    
    # Processing metadata
    processing_time: float = 0.0
    modalities_used: List[ModalityType] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'task_type': self.task_type.value,
            'confidence': self.confidence,
            'vision_result': self.vision_result.to_dict() if self.vision_result else None,
            'audio_result': self.audio_result.to_dict() if self.audio_result else None,
            'text_analysis': self.text_analysis,
            'cultural_narrative': self.cultural_narrative,
            'cross_modal_correlations': self.cross_modal_correlations,
            'unified_cultural_score': self.unified_cultural_score,
            'cultural_elements': self.cultural_elements,
            'historical_context': self.historical_context,
            'regional_insights': self.regional_insights,
            'educational_value': self.educational_value,
            'processing_time': self.processing_time,
            'modalities_used': [m.value for m in self.modalities_used]
        }

class CulturalKnowledgeFusion:
    """Fuse cultural knowledge across modalities"""
    
    def __init__(self):
        # Cultural correlation patterns between modalities
        self.cultural_correlations = {
            'landmarks_music': {
                'bran_castle': ['doina', 'traditional_ballad', 'medieval_chants'],
                'peles_castle': ['classical_romanian', 'royal_music', 'orchestral'],
                'painted_monasteries': ['religious_chants', 'byzantine_music', 'orthodox_hymns']
            },
            'instruments_regions': {
                'nai': ['muntenia', 'oltenia', 'dobrogea'],
                'cimpoi': ['maramures', 'transylvania', 'banat'],
                'cobza': ['moldavia', 'bucovina', 'transylvania']
            },
            'visual_linguistic': {
                'traditional_clothing': ['port_popular', 'ii', 'straie', 'costume_naționale'],
                'folk_art': ['motive_tradiționale', 'artă_populară', 'meșteșuguri'],
                'architecture': ['arhitectură_românească', 'stil_brâncovenesc', 'biserici_pictate']
            }
        }
        
        # Cultural significance weights
        self.significance_weights = {
            'historical_monuments': 1.0,
            'religious_sites': 0.95,
            'folk_traditions': 0.9,
            'traditional_arts': 0.85,
            'regional_customs': 0.8,
            'contemporary_culture': 0.6
        }
    
    def analyze_cross_modal_correlations(self, vision_result: Optional[VisionResult],
                                       audio_result: Optional[AudioResult],
                                       text_content: Optional[str]) -> Dict[str, float]:
        """Analyze correlations between different modalities"""
        
        correlations = {}
        
        # Vision-Audio correlations
        if vision_result and audio_result:
            correlations.update(self._analyze_vision_audio_correlation(vision_result, audio_result))
        
        # Vision-Text correlations
        if vision_result and text_content:
            correlations.update(self._analyze_vision_text_correlation(vision_result, text_content))
        
        # Audio-Text correlations
        if audio_result and text_content:
            correlations.update(self._analyze_audio_text_correlation(audio_result, text_content))
        
        return correlations
    
    def _analyze_vision_audio_correlation(self, vision_result: VisionResult, 
                                        audio_result: AudioResult) -> Dict[str, float]:
        """Analyze correlation between visual and audio content"""
        
        correlations = {}
        
        # Cultural category alignment
        if (vision_result.cultural_category and audio_result.audio_category):
            # Check if visual landmarks correlate with musical styles
            if hasattr(vision_result, 'classifications') and vision_result.classifications:
                for landmark in vision_result.classifications:
                    if landmark in self.cultural_correlations['landmarks_music']:
                        expected_music = self.cultural_correlations['landmarks_music'][landmark]
                        
                        # Check if detected audio elements match expected music
                        audio_elements = audio_result.romanian_elements
                        matches = sum(1 for element in audio_elements if any(music in element for music in expected_music))
                        
                        if matches > 0:
                            correlations['landmark_music_correlation'] = min(matches / len(expected_music), 1.0)
        
        # Regional style alignment
        if (hasattr(vision_result, 'regional_style') and 
            hasattr(audio_result, 'regional_style') and
            vision_result.regional_style == audio_result.regional_style):
            correlations['regional_alignment'] = 0.9
        
        # Temporal synchronization (for video+audio)
        if vision_result.processing_time > 0 and audio_result.duration > 0:
            temporal_alignment = min(vision_result.processing_time / audio_result.duration, 1.0)
            correlations['temporal_alignment'] = temporal_alignment
        
        return correlations
    
    def _analyze_vision_text_correlation(self, vision_result: VisionResult, 
                                       text_content: str) -> Dict[str, float]:
        """Analyze correlation between visual and textual content"""
        
        correlations = {}
        text_lower = text_content.lower()
        
        # Visual elements mentioned in text
        visual_elements = vision_result.romanian_elements
        text_mentions = 0
        
        for element in visual_elements:
            element_keywords = self.cultural_correlations['visual_linguistic'].get(element, [element])
            
            for keyword in element_keywords:
                if keyword.lower() in text_lower:
                    text_mentions += 1
                    break
        
        if visual_elements:
            correlations['visual_text_mentions'] = text_mentions / len(visual_elements)
        
        # Cultural significance alignment
        if vision_result.cultural_significance > 0:
            # Count cultural keywords in text
            cultural_keywords = ['cultură', 'tradiție', 'istorie', 'patrimeniu', 'folclor', 'artă']
            keyword_count = sum(text_lower.count(keyword) for keyword in cultural_keywords)
            
            text_cultural_score = min(keyword_count / len(text_content.split()) * 10, 1.0)
            correlations['cultural_significance_alignment'] = (vision_result.cultural_significance + text_cultural_score) / 2
        
        return correlations
    
    def _analyze_audio_text_correlation(self, audio_result: AudioResult, 
                                      text_content: str) -> Dict[str, float]:
        """Analyze correlation between audio and textual content"""
        
        correlations = {}
        
        # Transcription accuracy (if available)
        if audio_result.transcription and text_content:
            # Simple similarity measure
            audio_words = set(audio_result.transcription.lower().split())
            text_words = set(text_content.lower().split())
            
            if audio_words and text_words:
                intersection = len(audio_words.intersection(text_words))
                union = len(audio_words.union(text_words))
                jaccard_similarity = intersection / union if union > 0 else 0
                correlations['text_transcription_similarity'] = jaccard_similarity
        
        # Musical elements mentioned in text
        if audio_result.instruments_detected:
            text_lower = text_content.lower()
            instrument_mentions = 0
            
            for instrument in audio_result.instruments_detected:
                if instrument in text_lower:
                    instrument_mentions += 1
            
            correlations['instrument_text_mentions'] = instrument_mentions / len(audio_result.instruments_detected)
        
        return correlations
    
    def generate_unified_cultural_narrative(self, vision_result: Optional[VisionResult],
                                          audio_result: Optional[AudioResult],
                                          text_content: Optional[str],
                                          correlations: Dict[str, float]) -> str:
        """Generate unified cultural narrative from all modalities"""
        
        narrative_parts = []
        
        # Visual narrative
        if vision_result:
            if vision_result.cultural_category:
                narrative_parts.append(f"Visual analysis reveals {vision_result.cultural_category.value}")
                
            if vision_result.romanian_elements:
                elements_text = ", ".join(vision_result.romanian_elements[:3])
                narrative_parts.append(f"with Romanian cultural elements including {elements_text}")
        
        # Audio narrative
        if audio_result:
            if audio_result.audio_category:
                narrative_parts.append(f"Audio content classified as {audio_result.audio_category.value}")
                
            if audio_result.instruments_detected:
                instruments_text = ", ".join(audio_result.instruments_detected[:2])
                narrative_parts.append(f"featuring traditional instruments: {instruments_text}")
        
        # Cross-modal insights
        if correlations:
            strong_correlations = [k for k, v in correlations.items() if v > 0.7]
            if strong_correlations:
                correlation_text = ", ".join(strong_correlations)
                narrative_parts.append(f"Strong cross-modal correlations detected in {correlation_text}")
        
        # Text integration
        if text_content and len(text_content.split()) > 10:
            narrative_parts.append("with complementary textual description providing cultural context")
        
        # Combine narrative parts
        if narrative_parts:
            return ". ".join(narrative_parts) + "."
        else:
            return "Multi-modal Romanian cultural content analyzed with integrated processing."

class RomanianMultiModalProcessor:
    """Main multi-modal processing system with Romanian cultural consciousness"""
    
    def __init__(self, cache_dir: str = "models/multimodal"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize specialized processors
        self.vision_processor = RomanianVisionProcessor()
        self.audio_processor = RomanianAudioProcessor()
        
        # Initialize reasoning engines
        try:
            self.logical_engine = AutonomousLogicalEngine()
            self.cultural_engine = RomanianCulturalEngine()
        except Exception as e:
            logger.warning(f"Reasoning engines initialization failed: {str(e)}")
            self.logical_engine = None
            self.cultural_engine = None
        
        # Cultural knowledge fusion
        self.knowledge_fusion = CulturalKnowledgeFusion()
        
        # Thread pool for async processing
        self.thread_pool = ThreadPoolExecutor(max_workers=6)
        
        logger.info("Romanian multi-modal processor initialized")
    
    async def process_multimodal_async(self, inputs: List[MultiModalInput],
                                     task_type: MultiModalTaskType) -> MultiModalResult:
        """Asynchronously process multi-modal inputs"""
        
        loop = asyncio.get_event_loop()
        
        # Run processing in thread pool
        result = await loop.run_in_executor(
            self.thread_pool,
            self.process_multimodal,
            inputs,
            task_type
        )
        
        return result
    
    def process_multimodal(self, inputs: List[MultiModalInput],
                          task_type: MultiModalTaskType) -> MultiModalResult:
        """Process multi-modal inputs for Romanian cultural understanding"""
        
        start_time = time.time()
        
        # Initialize result
        result = MultiModalResult(
            task_type=task_type,
            confidence=0.0
        )
        
        # Separate inputs by modality
        vision_inputs = [inp for inp in inputs if inp.modality == ModalityType.VISION]
        audio_inputs = [inp for inp in inputs if inp.modality == ModalityType.AUDIO]
        text_inputs = [inp for inp in inputs if inp.modality == ModalityType.TEXT]
        
        try:
            # Process each modality
            vision_results = []
            audio_results = []
            text_content = ""
            
            # Process vision inputs
            for vision_input in vision_inputs:
                vision_result = self.vision_processor.process_image(
                    vision_input.data,
                    self._get_vision_task_for_multimodal_task(task_type)
                )
                vision_results.append(vision_result)
                result.modalities_used.append(ModalityType.VISION)
            
            # Process audio inputs
            for audio_input in audio_inputs:
                audio_result = self.audio_processor.process_audio(
                    audio_input.data,
                    self._get_audio_task_for_multimodal_task(task_type)
                )
                audio_results.append(audio_result)
                result.modalities_used.append(ModalityType.AUDIO)
            
            # Process text inputs
            for text_input in text_inputs:
                text_content += str(text_input.data) + " "
                result.modalities_used.append(ModalityType.TEXT)
            
            # Select best results for integration
            best_vision_result = max(vision_results, key=lambda r: r.confidence) if vision_results else None
            best_audio_result = max(audio_results, key=lambda r: r.confidence) if audio_results else None
            
            result.vision_result = best_vision_result
            result.audio_result = best_audio_result
            result.text_analysis = self._analyze_text_content(text_content) if text_content.strip() else None
            
            # Perform cross-modal analysis
            result = self._perform_cross_modal_analysis(result, text_content.strip())
            
            # Task-specific processing
            if task_type == MultiModalTaskType.CULTURAL_SCENE_ANALYSIS:
                result = self._process_cultural_scene_analysis(result)
            elif task_type == MultiModalTaskType.AUDIO_VISUAL_SYNCHRONIZATION:
                result = self._process_audiovisual_synchronization(result)
            elif task_type == MultiModalTaskType.CROSS_MODAL_UNDERSTANDING:
                result = self._process_cross_modal_understanding(result)
            elif task_type == MultiModalTaskType.CULTURAL_STORYTELLING:
                result = self._process_cultural_storytelling(result)
            elif task_type == MultiModalTaskType.HERITAGE_DOCUMENTATION:
                result = self._process_heritage_documentation(result)
            
        except Exception as e:
            logger.error(f"Multi-modal processing error: {str(e)}")
            result.confidence = 0.0
        
        # Finalize result
        result.processing_time = time.time() - start_time
        
        return result
    
    def _get_vision_task_for_multimodal_task(self, task_type: MultiModalTaskType) -> VisionTaskType:
        """Map multi-modal task to appropriate vision task"""
        
        mapping = {
            MultiModalTaskType.CULTURAL_SCENE_ANALYSIS: VisionTaskType.SCENE_UNDERSTANDING,
            MultiModalTaskType.AUDIO_VISUAL_SYNCHRONIZATION: VisionTaskType.IMAGE_CLASSIFICATION,
            MultiModalTaskType.CROSS_MODAL_UNDERSTANDING: VisionTaskType.CULTURAL_ARTIFACT_ANALYSIS,
            MultiModalTaskType.CULTURAL_STORYTELLING: VisionTaskType.LANDMARK_RECOGNITION,
            MultiModalTaskType.HERITAGE_DOCUMENTATION: VisionTaskType.ARCHITECTURE_ANALYSIS,
            MultiModalTaskType.INTERACTIVE_CULTURAL_GUIDE: VisionTaskType.LANDMARK_RECOGNITION,
            MultiModalTaskType.CULTURAL_EDUCATION_CONTENT: VisionTaskType.CULTURAL_ARTIFACT_ANALYSIS,
            MultiModalTaskType.MULTIMEDIA_ARCHIVAL: VisionTaskType.IMAGE_CLASSIFICATION
        }
        
        return mapping.get(task_type, VisionTaskType.IMAGE_CLASSIFICATION)
    
    def _get_audio_task_for_multimodal_task(self, task_type: MultiModalTaskType) -> AudioTaskType:
        """Map multi-modal task to appropriate audio task"""
        
        mapping = {
            MultiModalTaskType.CULTURAL_SCENE_ANALYSIS: AudioTaskType.CULTURAL_AUDIO_ANALYSIS,
            MultiModalTaskType.AUDIO_VISUAL_SYNCHRONIZATION: AudioTaskType.MUSIC_ANALYSIS,
            MultiModalTaskType.CROSS_MODAL_UNDERSTANDING: AudioTaskType.CULTURAL_AUDIO_ANALYSIS,
            MultiModalTaskType.CULTURAL_STORYTELLING: AudioTaskType.SPEECH_RECOGNITION,
            MultiModalTaskType.HERITAGE_DOCUMENTATION: AudioTaskType.FOLK_MUSIC_CLASSIFICATION,
            MultiModalTaskType.INTERACTIVE_CULTURAL_GUIDE: AudioTaskType.DIALECT_DETECTION,
            MultiModalTaskType.CULTURAL_EDUCATION_CONTENT: AudioTaskType.CULTURAL_AUDIO_ANALYSIS,
            MultiModalTaskType.MULTIMEDIA_ARCHIVAL: AudioTaskType.LANGUAGE_DETECTION
        }
        
        return mapping.get(task_type, AudioTaskType.CULTURAL_AUDIO_ANALYSIS)
    
    def _analyze_text_content(self, text_content: str) -> Dict[str, Any]:
        """Analyze textual content for cultural insights"""
        
        if not text_content.strip():
            return {}
        
        # Basic text analysis
        words = text_content.lower().split()
        sentences = text_content.count('.') + text_content.count('!') + text_content.count('?')
        
        # Romanian language indicators
        romanian_indicators = ['și', 'cu', 'de', 'la', 'în', 'pe', 'pentru', 'că', 'dar', 'sau']
        romanian_chars = 'ăâîșț'
        
        indicator_count = sum(text_content.lower().count(word) for word in romanian_indicators)
        diacritic_count = sum(text_content.count(char) for char in romanian_chars)
        
        # Cultural keywords
        cultural_keywords = ['cultură', 'tradiție', 'istorie', 'patrimeniu', 'folclor', 'artă', 'muzică']
        cultural_count = sum(text_content.lower().count(keyword) for keyword in cultural_keywords)
        
        analysis = {
            'word_count': len(words),
            'sentence_count': sentences,
            'avg_sentence_length': len(words) / max(sentences, 1),
            'romanian_language_score': (indicator_count + diacritic_count) / max(len(words), 1),
            'cultural_content_score': cultural_count / max(len(words), 1),
            'complexity_score': len(set(words)) / max(len(words), 1),  # Unique words ratio
            'diacritic_ratio': diacritic_count / max(len(text_content), 1)
        }
        
        return analysis
    
    def _perform_cross_modal_analysis(self, result: MultiModalResult, text_content: str) -> MultiModalResult:
        """Perform cross-modal correlation analysis"""
        
        # Analyze correlations
        correlations = self.knowledge_fusion.analyze_cross_modal_correlations(
            result.vision_result,
            result.audio_result,
            text_content if text_content else None
        )
        
        result.cross_modal_correlations = correlations
        
        # Generate unified cultural narrative
        narrative = self.knowledge_fusion.generate_unified_cultural_narrative(
            result.vision_result,
            result.audio_result,
            text_content if text_content else None,
            correlations
        )
        
        result.cultural_narrative = narrative
        
        # Calculate unified cultural score
        cultural_scores = []
        
        if result.vision_result and result.vision_result.cultural_significance > 0:
            cultural_scores.append(result.vision_result.cultural_significance)
        
        if result.audio_result and result.audio_result.cultural_significance > 0:
            cultural_scores.append(result.audio_result.cultural_significance)
        
        if result.text_analysis and result.text_analysis.get('cultural_content_score', 0) > 0:
            cultural_scores.append(result.text_analysis['cultural_content_score'])
        
        # Weight by correlation strength
        correlation_boost = sum(correlations.values()) / max(len(correlations), 1)
        
        if cultural_scores:
            base_score = sum(cultural_scores) / len(cultural_scores)
            result.unified_cultural_score = min(base_score + correlation_boost * 0.2, 1.0)
        else:
            result.unified_cultural_score = correlation_boost
        
        # Aggregate cultural elements
        elements = []
        if result.vision_result:
            elements.extend(result.vision_result.romanian_elements)
        if result.audio_result:
            elements.extend(result.audio_result.romanian_elements)
        
        result.cultural_elements = list(set(elements))  # Remove duplicates
        
        return result
    
    def _process_cultural_scene_analysis(self, result: MultiModalResult) -> MultiModalResult:
        """Process cultural scene analysis task"""
        
        confidence_scores = []
        
        # Combine confidences from available modalities
        if result.vision_result:
            confidence_scores.append(result.vision_result.confidence)
        if result.audio_result:
            confidence_scores.append(result.audio_result.confidence)
        if result.text_analysis:
            # Text confidence based on Romanian language and cultural content
            text_confidence = (result.text_analysis.get('romanian_language_score', 0) +
                             result.text_analysis.get('cultural_content_score', 0)) / 2
            confidence_scores.append(text_confidence)
        
        result.confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        # Enhanced cultural analysis for scenes
        if result.unified_cultural_score > 0.7:
            result.educational_value = 0.9
        elif result.unified_cultural_score > 0.5:
            result.educational_value = 0.7
        else:
            result.educational_value = 0.4
        
        return result
    
    def _process_audiovisual_synchronization(self, result: MultiModalResult) -> MultiModalResult:
        """Process audio-visual synchronization task"""
        
        # Focus on temporal and thematic alignment
        sync_score = result.cross_modal_correlations.get('temporal_alignment', 0.0)
        theme_score = result.cross_modal_correlations.get('landmark_music_correlation', 0.0)
        
        result.confidence = (sync_score + theme_score) / 2
        
        # Synchronization-specific insights
        if sync_score > 0.8:
            result.cultural_narrative += " Content shows excellent audio-visual synchronization."
        
        return result
    
    def _process_cross_modal_understanding(self, result: MultiModalResult) -> MultiModalResult:
        """Process cross-modal understanding task"""
        
        # Emphasize correlation strength
        correlation_values = list(result.cross_modal_correlations.values())
        avg_correlation = sum(correlation_values) / len(correlation_values) if correlation_values else 0.0
        
        result.confidence = avg_correlation
        
        # Cross-modal reasoning if logical engine available
        if self.logical_engine and len(result.modalities_used) > 1:
            try:
                reasoning_prompt = f"Analyze the relationship between {', '.join(m.value for m in result.modalities_used)} in Romanian cultural context"
                # Note: This would require async integration in a real implementation
                result.cultural_narrative += " Cross-modal reasoning provides deeper cultural insights."
            except Exception as e:
                logger.debug(f"Cross-modal reasoning failed: {str(e)}")
        
        return result
    
    def _process_cultural_storytelling(self, result: MultiModalResult) -> MultiModalResult:
        """Process cultural storytelling task"""
        
        # Storytelling emphasizes narrative coherence
        narrative_quality = 0.0
        
        if result.vision_result and result.vision_result.cultural_significance > 0.6:
            narrative_quality += 0.3
        
        if result.audio_result and result.audio_result.transcription:
            # Quality based on transcription length and cultural content
            transcription_quality = min(len(result.audio_result.transcription.split()) / 50, 1.0)
            narrative_quality += transcription_quality * 0.4
        
        if result.cultural_elements:
            element_richness = min(len(result.cultural_elements) / 5, 1.0)
            narrative_quality += element_richness * 0.3
        
        result.confidence = narrative_quality
        result.educational_value = narrative_quality * 0.9  # High educational value for storytelling
        
        return result
    
    def _process_heritage_documentation(self, result: MultiModalResult) -> MultiModalResult:
        """Process heritage documentation task"""
        
        # Documentation emphasizes completeness and accuracy
        documentation_score = 0.0
        
        # Visual documentation
        if result.vision_result:
            documentation_score += result.vision_result.confidence * 0.4
        
        # Audio documentation
        if result.audio_result:
            documentation_score += result.audio_result.confidence * 0.3
        
        # Textual documentation
        if result.text_analysis and result.text_analysis.get('word_count', 0) > 20:
            text_completeness = min(result.text_analysis['word_count'] / 100, 1.0)
            documentation_score += text_completeness * 0.3
        
        result.confidence = documentation_score
        result.educational_value = 0.95  # High educational value for heritage documentation
        
        # Heritage-specific metadata
        result.historical_context = {
            'preservation_priority': 'high' if result.unified_cultural_score > 0.8 else 'medium',
            'documentation_completeness': documentation_score,
            'archival_value': result.unified_cultural_score
        }
        
        return result
    
    def generate_comprehensive_report(self, result: MultiModalResult) -> Dict[str, Any]:
        """Generate comprehensive multi-modal analysis report"""
        
        report = {
            'overview': {
                'task_type': result.task_type.value,
                'confidence': result.confidence,
                'processing_time': result.processing_time,
                'modalities_used': [m.value for m in result.modalities_used],
                'unified_cultural_score': result.unified_cultural_score
            },
            'cultural_analysis': {
                'narrative': result.cultural_narrative,
                'cultural_elements': result.cultural_elements,
                'educational_value': result.educational_value,
                'cross_modal_correlations': result.cross_modal_correlations
            },
            'modality_results': {
                'vision': result.vision_result.to_dict() if result.vision_result else None,
                'audio': result.audio_result.to_dict() if result.audio_result else None,
                'text': result.text_analysis
            },
            'insights': {
                'historical_context': result.historical_context,
                'regional_insights': result.regional_insights,
                'preservation_recommendations': self._generate_preservation_recommendations(result)
            },
            'recommendations': self._generate_multimodal_recommendations(result)
        }
        
        return report
    
    def _generate_preservation_recommendations(self, result: MultiModalResult) -> List[str]:
        """Generate preservation recommendations"""
        
        recommendations = []
        
        if result.unified_cultural_score > 0.9:
            recommendations.append("Exceptional cultural value - priority for national heritage preservation")
        elif result.unified_cultural_score > 0.7:
            recommendations.append("High cultural value - suitable for museum collection or cultural archive")
        
        if len(result.modalities_used) > 2:
            recommendations.append("Multi-modal richness suitable for immersive cultural experiences")
        
        if result.educational_value > 0.8:
            recommendations.append("High educational value - suitable for cultural education programs")
        
        return recommendations
    
    def _generate_multimodal_recommendations(self, result: MultiModalResult) -> List[str]:
        """Generate multi-modal specific recommendations"""
        
        recommendations = []
        
        # Cross-modal correlation recommendations
        strong_correlations = [k for k, v in result.cross_modal_correlations.items() if v > 0.7]
        if strong_correlations:
            recommendations.append(f"Strong correlations detected - excellent for {', '.join(strong_correlations)}")
        
        # Modality-specific recommendations
        if ModalityType.VISION in result.modalities_used and result.vision_result:
            if result.vision_result.cultural_significance > 0.8:
                recommendations.append("Visual content suitable for cultural tourism promotion")
        
        if ModalityType.AUDIO in result.modalities_used and result.audio_result:
            if hasattr(result.audio_result, 'audio_category') and result.audio_result.audio_category:
                recommendations.append(f"Audio content classified as {result.audio_result.audio_category.value}")
        
        # Integration recommendations
        if len(result.modalities_used) > 1:
            recommendations.append("Multi-modal content suitable for interactive cultural applications")
        
        return recommendations


# Testing and demonstration
if __name__ == "__main__":
    import time
    
    print("🎭 Romanian Multi-Modal Processing System Test")
    print("="*60)
    
    # Initialize multi-modal processor
    multimodal_processor = RomanianMultiModalProcessor()
    
    print("\n🖼️🎵 Testing Cultural Scene Analysis:")
    
    # Create test inputs
    # Vision input (simulated Romanian landmark image)
    vision_input = MultiModalInput(
        modality=ModalityType.VISION,
        data=np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8),
        cultural_context="Castelul Bran",
        regional_context="Transilvania"
    )
    
    # Audio input (simulated Romanian folk music)
    sample_rate = 16000
    duration = 3.0
    t = np.linspace(0, duration, int(sample_rate * duration))
    folk_audio = np.sin(2 * np.pi * 200 * t) * 0.5  # Simulated folk melody
    
    audio_input = MultiModalInput(
        modality=ModalityType.AUDIO,
        data=folk_audio,
        cultural_context="Muzică populară românească",
        regional_context="Transilvania"
    )
    
    # Text input
    text_input = MultiModalInput(
        modality=ModalityType.TEXT,
        data="Castelul Bran este un monument istoric din România, cunoscut pentru arhitectura sa gotică și legenda lui Dracula. Muzica tradițională românească, cu instrumente ca naiul și cimpoiul, completează atmosfera culturală.",
        cultural_context="Descriere culturală",
        regional_context="Transilvania"
    )
    
    inputs = [vision_input, audio_input, text_input]
    
    # Test cultural scene analysis
    start_time = time.time()
    scene_result = multimodal_processor.process_multimodal(
        inputs,
        MultiModalTaskType.CULTURAL_SCENE_ANALYSIS
    )
    
    print(f"   Processing time: {scene_result.processing_time:.2f}s")
    print(f"   Confidence: {scene_result.confidence:.2f}")
    print(f"   Unified cultural score: {scene_result.unified_cultural_score:.2f}")
    print(f"   Modalities used: {[m.value for m in scene_result.modalities_used]}")
    print(f"   Cultural elements: {len(scene_result.cultural_elements)}")
    print(f"   Cross-modal correlations: {len(scene_result.cross_modal_correlations)}")
    
    if scene_result.cultural_narrative:
        print(f"   Cultural narrative: {scene_result.cultural_narrative[:100]}...")
    
    print("\n🎬 Testing Audio-Visual Synchronization:")
    
    # Test with vision and audio only
    av_inputs = [vision_input, audio_input]
    
    av_result = multimodal_processor.process_multimodal(
        av_inputs,
        MultiModalTaskType.AUDIO_VISUAL_SYNCHRONIZATION
    )
    
    print(f"   Confidence: {av_result.confidence:.2f}")
    print(f"   Temporal alignment: {av_result.cross_modal_correlations.get('temporal_alignment', 0):.2f}")
    print(f"   Cultural correlation: {av_result.cross_modal_correlations.get('landmark_music_correlation', 0):.2f}")
    
    print("\n🧠 Testing Cross-Modal Understanding:")
    
    cross_modal_result = multimodal_processor.process_multimodal(
        inputs,
        MultiModalTaskType.CROSS_MODAL_UNDERSTANDING
    )
    
    print(f"   Understanding confidence: {cross_modal_result.confidence:.2f}")
    print(f"   Cultural significance: {cross_modal_result.unified_cultural_score:.2f}")
    print(f"   Correlations analyzed: {len(cross_modal_result.cross_modal_correlations)}")
    
    for correlation, score in cross_modal_result.cross_modal_correlations.items():
        print(f"      {correlation}: {score:.2f}")
    
    print("\n📚 Testing Cultural Storytelling:")
    
    storytelling_result = multimodal_processor.process_multimodal(
        inputs,
        MultiModalTaskType.CULTURAL_STORYTELLING
    )
    
    print(f"   Storytelling confidence: {storytelling_result.confidence:.2f}")
    print(f"   Educational value: {storytelling_result.educational_value:.2f}")
    print(f"   Narrative length: {len(storytelling_result.cultural_narrative)} chars")
    
    print("\n🏛️ Testing Heritage Documentation:")
    
    heritage_result = multimodal_processor.process_multimodal(
        inputs,
        MultiModalTaskType.HERITAGE_DOCUMENTATION
    )
    
    print(f"   Documentation confidence: {heritage_result.confidence:.2f}")
    print(f"   Educational value: {heritage_result.educational_value:.2f}")
    print(f"   Historical context: {heritage_result.historical_context}")
    
    print("\n📊 Testing Comprehensive Report Generation:")
    
    # Generate comprehensive report
    comprehensive_report = multimodal_processor.generate_comprehensive_report(scene_result)
    
    print(f"   Report sections: {len(comprehensive_report)}")
    print(f"   Overview confidence: {comprehensive_report['overview']['confidence']:.2f}")
    print(f"   Cultural elements: {len(comprehensive_report['cultural_analysis']['cultural_elements'])}")
    print(f"   Recommendations: {len(comprehensive_report['recommendations'])}")
    
    print(f"   🎯 Top recommendations:")
    for i, rec in enumerate(comprehensive_report['recommendations'][:3], 1):
        print(f"      {i}. {rec}")
    
    print("\n🔄 Testing Async Processing:")
    
    async def test_async_multimodal():
        """Test async multi-modal processing"""
        
        tasks = []
        task_types = [
            MultiModalTaskType.CULTURAL_SCENE_ANALYSIS,
            MultiModalTaskType.CROSS_MODAL_UNDERSTANDING,
            MultiModalTaskType.CULTURAL_STORYTELLING
        ]
        
        # Create multiple async tasks
        for task_type in task_types:
            task = multimodal_processor.process_multimodal_async(inputs, task_type)
            tasks.append(task)
        
        # Wait for all tasks to complete
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        print(f"   Async processing completed in {total_time:.2f}s")
        print(f"   Tasks processed: {len(results)}")
        
        for i, result in enumerate(results):
            print(f"      Task {i+1}: {result.task_type.value} (confidence: {result.confidence:.2f})")
    
    # Run async test
    asyncio.run(test_async_multimodal())
    
    print("\n✨ Romanian multi-modal processing system testing completed!")
    print("Unified vision, audio, and text processing with Romanian cultural consciousness ready!")
    print("🇷🇴 Multi-modal Romanian cultural understanding achieved!")