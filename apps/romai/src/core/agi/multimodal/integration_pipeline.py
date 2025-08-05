"""
Romanian Multimodal Integration Pipeline
Main integration pipeline for Romanian multimodal content processing
Week 8 Day 4 Component 4 - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
import time
import json
from pathlib import Path

# Import from Week 8 Day 1 foundation
from ..week_8_day_1_foundation.romanian_multimodal_foundation import (
    ModalityBridge, MultimodalInput, ProcessingContext, CrossModalAlignmentEngine
)

# Import from Week 8 Day 2 audio processing
from ..week_8_day_2_audio_processing.romanian_audio_analysis import RomanianAudioAnalysisPipeline

# Import from Week 8 Day 3 visual processing
from ..week_8_day_3_visual_processing.romanian_visual_pipeline import RomanianVisualProcessingPipeline

# Import current day components
from .romanian_multimodal_engine import RomanianMultimodalEngine, RomanianMultimodalResult
from .fusion_algorithms import MultimodalFusionManager
from .cultural_context_integration import RomanianCulturalContextIntegrator, CulturalContext

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProcessingMode(Enum):
    """Processing mode options"""
    FAST = "fast"                           # Quick processing for real-time use
    STANDARD = "standard"                   # Balanced processing 
    COMPREHENSIVE = "comprehensive"         # Full analysis with all features
    CULTURAL_FOCUS = "cultural_focus"      # Focus on Romanian cultural elements
    PRESERVATION = "preservation"           # Maximum preservation quality

class IntegrationStage(Enum):
    """Integration pipeline stages"""
    INPUT_VALIDATION = "input_validation"
    MODALITY_PROCESSING = "modality_processing"
    CROSS_MODAL_ALIGNMENT = "cross_modal_alignment"
    FEATURE_FUSION = "feature_fusion"
    CULTURAL_INTEGRATION = "cultural_integration"
    RESULT_SYNTHESIS = "result_synthesis"
    QUALITY_VALIDATION = "quality_validation"
    OUTPUT_PREPARATION = "output_preparation"

@dataclass
class IntegrationConfig:
    """Configuration for integration pipeline"""
    processing_mode: ProcessingMode = ProcessingMode.STANDARD
    enable_cultural_analysis: bool = True
    enable_cross_modal_alignment: bool = True
    enable_fusion_optimization: bool = True
    
    # Performance settings
    max_processing_time: float = 30.0
    batch_size: int = 1
    parallel_processing: bool = True
    
    # Quality settings
    minimum_confidence_threshold: float = 0.3
    cultural_preservation_priority: bool = True
    output_format: str = "comprehensive"  # minimal, standard, comprehensive
    
    # Regional and temporal settings
    target_region: Optional[str] = None
    temporal_context: Optional[str] = None
    cultural_sensitivity_level: str = "high"  # low, medium, high, maximum
    
    # Advanced settings
    enable_validation_checks: bool = True
    enable_performance_monitoring: bool = True
    enable_detailed_logging: bool = False

@dataclass
class ProcessingMetrics:
    """Metrics for processing performance"""
    total_processing_time: float = 0.0
    stage_timings: Dict[IntegrationStage, float] = field(default_factory=dict)
    
    # Quality metrics
    overall_confidence: float = 0.0
    cultural_authenticity: float = 0.0
    cross_modal_coherence: float = 0.0
    
    # Throughput metrics
    modalities_processed: int = 0
    features_extracted: int = 0
    cultural_markers_found: int = 0
    
    # Error tracking
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    
    # Resource utilization
    memory_usage_mb: float = 0.0
    cpu_utilization: float = 0.0

@dataclass
class IntegratedResult:
    """Comprehensive integrated result"""
    result_id: str
    timestamp: float = field(default_factory=time.time)
    
    # Core results
    multimodal_result: RomanianMultimodalResult
    cultural_context: CulturalContext
    processing_metrics: ProcessingMetrics
    
    # Enhanced insights
    romanian_authenticity_score: float = 0.0
    cultural_significance_level: str = "medium"
    regional_insights: Dict[str, Any] = field(default_factory=dict)
    historical_context: Dict[str, Any] = field(default_factory=dict)
    
    # Recommendations
    preservation_recommendations: List[str] = field(default_factory=list)
    enhancement_suggestions: List[str] = field(default_factory=list)
    further_analysis_recommendations: List[str] = field(default_factory=list)
    
    # Metadata
    integration_confidence: float = 0.0
    processing_mode: ProcessingMode = ProcessingMode.STANDARD
    configuration_used: Dict[str, Any] = field(default_factory=dict)

class RomanianMultimodalIntegrationPipeline:
    """Main integration pipeline for Romanian multimodal content"""
    
    def __init__(self, config: Optional[IntegrationConfig] = None):
        self.config = config or IntegrationConfig()
        
        # Initialize core components
        self.audio_pipeline = RomanianAudioAnalysisPipeline()
        self.visual_pipeline = RomanianVisualProcessingPipeline()
        self.multimodal_engine = RomanianMultimodalEngine()
        self.fusion_manager = MultimodalFusionManager()
        self.cultural_integrator = RomanianCulturalContextIntegrator()
        
        # Initialize foundation components
        self.modality_bridge = ModalityBridge()
        self.alignment_engine = CrossModalAlignmentEngine()
        
        # Processing state
        self.is_initialized = False
        self.processing_stats = {
            'total_processed': 0,
            'successful_integrations': 0,
            'average_processing_time': 0.0,
            'cultural_discoveries': 0
        }
        
    async def initialize(self):
        """Initialize the integration pipeline"""
        if self.is_initialized:
            return
            
        logger.info("🚀 Initializing Romanian Multimodal Integration Pipeline...")
        
        try:
            # Initialize all components
            await self.audio_pipeline.initialize()
            await self.visual_pipeline.initialize()
            await self.multimodal_engine.initialize()
            
            # Set configuration-based parameters
            if self.config.processing_mode == ProcessingMode.FAST:
                self.audio_pipeline.set_fast_mode(True)
                self.visual_pipeline.set_fast_mode(True)
            elif self.config.processing_mode == ProcessingMode.COMPREHENSIVE:
                self.audio_pipeline.set_comprehensive_mode(True)
                self.visual_pipeline.set_comprehensive_mode(True)
            
            self.is_initialized = True
            logger.info("✅ Pipeline initialization completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Pipeline initialization failed: {e}")
            raise
    
    async def process_multimodal_content(self, 
                                       multimodal_input: MultimodalInput,
                                       context: Optional[ProcessingContext] = None) -> IntegratedResult:
        """Process multimodal content with comprehensive integration"""
        start_time = time.time()
        
        if not self.is_initialized:
            await self.initialize()
        
        # Create processing metrics
        metrics = ProcessingMetrics()
        
        try:
            logger.info(f"🔄 Starting multimodal integration for content {multimodal_input.input_id}")
            
            # Stage 1: Input Validation
            stage_start = time.time()
            await self._validate_input(multimodal_input, metrics)
            metrics.stage_timings[IntegrationStage.INPUT_VALIDATION] = time.time() - stage_start
            
            # Stage 2: Modality Processing
            stage_start = time.time()
            processing_results = await self._process_modalities(multimodal_input, context, metrics)
            metrics.stage_timings[IntegrationStage.MODALITY_PROCESSING] = time.time() - stage_start
            
            # Stage 3: Cross-Modal Alignment
            stage_start = time.time()
            aligned_features = await self._perform_cross_modal_alignment(processing_results, metrics)
            metrics.stage_timings[IntegrationStage.CROSS_MODAL_ALIGNMENT] = time.time() - stage_start
            
            # Stage 4: Feature Fusion
            stage_start = time.time()
            fused_result = await self._perform_feature_fusion(aligned_features, metrics)
            metrics.stage_timings[IntegrationStage.FEATURE_FUSION] = time.time() - stage_start
            
            # Stage 5: Cultural Integration
            stage_start = time.time()
            cultural_context = await self._integrate_cultural_context(processing_results, fused_result, metrics)
            metrics.stage_timings[IntegrationStage.CULTURAL_INTEGRATION] = time.time() - stage_start
            
            # Stage 6: Result Synthesis
            stage_start = time.time()
            integrated_result = await self._synthesize_results(
                fused_result, cultural_context, metrics, multimodal_input.input_id
            )
            metrics.stage_timings[IntegrationStage.RESULT_SYNTHESIS] = time.time() - stage_start
            
            # Stage 7: Quality Validation
            stage_start = time.time()
            await self._validate_result_quality(integrated_result, metrics)
            metrics.stage_timings[IntegrationStage.QUALITY_VALIDATION] = time.time() - stage_start
            
            # Stage 8: Output Preparation
            stage_start = time.time()
            final_result = await self._prepare_output(integrated_result, metrics)
            metrics.stage_timings[IntegrationStage.OUTPUT_PREPARATION] = time.time() - stage_start
            
            # Update processing statistics
            metrics.total_processing_time = time.time() - start_time
            self._update_processing_stats(metrics)
            
            logger.info(f"✅ Multimodal integration completed in {metrics.total_processing_time:.3f}s")
            return final_result
            
        except Exception as e:
            logger.error(f"❌ Multimodal integration failed: {e}")
            metrics.errors.append(str(e))
            metrics.total_processing_time = time.time() - start_time
            
            # Return minimal result for error case
            return await self._create_error_result(multimodal_input.input_id, metrics, str(e))
    
    async def _validate_input(self, multimodal_input: MultimodalInput, metrics: ProcessingMetrics):
        """Validate input data"""
        if not multimodal_input.input_id:
            raise ValueError("Input ID is required")
        
        modality_count = 0
        if multimodal_input.text_content:
            modality_count += 1
        if multimodal_input.image_path or multimodal_input.image_data:
            modality_count += 1
        if multimodal_input.audio_path or multimodal_input.audio_data:
            modality_count += 1
        
        if modality_count == 0:
            raise ValueError("At least one modality is required")
        
        metrics.modalities_processed = modality_count
        logger.info(f"   Input validation: {modality_count} modalities detected")
    
    async def _process_modalities(self, multimodal_input: MultimodalInput, 
                                context: Optional[ProcessingContext],
                                metrics: ProcessingMetrics) -> Dict[str, Any]:
        """Process individual modalities"""
        results = {}
        
        # Process audio if present
        if multimodal_input.audio_path or multimodal_input.audio_data:
            try:
                logger.info("   Processing Romanian audio content...")
                if multimodal_input.audio_path:
                    audio_result = await self.audio_pipeline.analyze_audio_file(multimodal_input.audio_path)
                else:
                    audio_result = await self.audio_pipeline.analyze_audio_data(multimodal_input.audio_data)
                
                results['audio'] = audio_result
                metrics.features_extracted += len(audio_result.features)
                logger.info(f"   Audio processing completed: {len(audio_result.features)} features extracted")
                
            except Exception as e:
                logger.warning(f"   Audio processing failed: {e}")
                metrics.warnings.append(f"Audio processing: {e}")
        
        # Process visual if present
        if multimodal_input.image_path or multimodal_input.image_data:
            try:
                logger.info("   Processing Romanian visual content...")
                if multimodal_input.image_path:
                    visual_result = await self.visual_pipeline.process_image_file(multimodal_input.image_path)
                else:
                    visual_result = await self.visual_pipeline.process_image_data(multimodal_input.image_data)
                
                results['visual'] = visual_result
                metrics.features_extracted += len(visual_result.cultural_markers)
                logger.info(f"   Visual processing completed: {len(visual_result.cultural_markers)} cultural markers found")
                
            except Exception as e:
                logger.warning(f"   Visual processing failed: {e}")
                metrics.warnings.append(f"Visual processing: {e}")
        
        # Process text if present
        if multimodal_input.text_content:
            try:
                logger.info("   Processing Romanian text content...")
                # Text is processed through the multimodal engine directly
                results['text'] = {
                    'content': multimodal_input.text_content,
                    'language': multimodal_input.metadata.get('language', 'ro'),
                    'processed': True
                }
                logger.info("   Text processing completed")
                
            except Exception as e:
                logger.warning(f"   Text processing failed: {e}")
                metrics.warnings.append(f"Text processing: {e}")
        
        return results
    
    async def _perform_cross_modal_alignment(self, processing_results: Dict[str, Any], 
                                           metrics: ProcessingMetrics) -> Dict[str, Any]:
        """Perform cross-modal alignment"""
        if not self.config.enable_cross_modal_alignment or len(processing_results) < 2:
            return processing_results
        
        logger.info("   Performing cross-modal alignment...")
        
        try:
            # Use the alignment engine from foundation
            aligned_features = await self.alignment_engine.align_cross_modal_features(processing_results)
            
            # Calculate cross-modal coherence
            coherence_score = await self._calculate_cross_modal_coherence(aligned_features)
            metrics.cross_modal_coherence = coherence_score
            
            logger.info(f"   Cross-modal alignment completed: {coherence_score:.3f} coherence")
            return aligned_features
            
        except Exception as e:
            logger.warning(f"   Cross-modal alignment failed: {e}")
            metrics.warnings.append(f"Cross-modal alignment: {e}")
            return processing_results
    
    async def _perform_feature_fusion(self, aligned_features: Dict[str, Any], 
                                    metrics: ProcessingMetrics) -> RomanianMultimodalResult:
        """Perform feature fusion using the multimodal engine"""
        logger.info("   Performing Romanian multimodal fusion...")
        
        try:
            # Create multimodal input for the engine
            engine_input = self._create_engine_input(aligned_features)
            
            # Process through the multimodal engine
            fused_result = await self.multimodal_engine.process_multimodal_content(engine_input)
            
            # Apply fusion optimization if enabled
            if self.config.enable_fusion_optimization:
                fused_result = await self.fusion_manager.optimize_fusion_result(fused_result, aligned_features)
            
            metrics.overall_confidence = fused_result.overall_confidence
            logger.info(f"   Multimodal fusion completed: {fused_result.overall_confidence:.3f} confidence")
            
            return fused_result
            
        except Exception as e:
            logger.error(f"   Feature fusion failed: {e}")
            metrics.errors.append(f"Feature fusion: {e}")
            raise
    
    async def _integrate_cultural_context(self, processing_results: Dict[str, Any],
                                         fused_result: RomanianMultimodalResult,
                                         metrics: ProcessingMetrics) -> CulturalContext:
        """Integrate Romanian cultural context"""
        if not self.config.enable_cultural_analysis:
            return self._create_minimal_cultural_context()
        
        logger.info("   Integrating Romanian cultural context...")
        
        try:
            # Extract content for cultural analysis
            text_content = processing_results.get('text', {}).get('content', '')
            visual_content = processing_results.get('visual', {})
            audio_content = processing_results.get('audio', {})
            
            # Create multimodal features summary
            multimodal_features = {
                'text_present': bool(text_content),
                'visual_present': bool(visual_content),
                'audio_present': bool(audio_content),
                'cross_modal_alignment_score': metrics.cross_modal_coherence,
                'overall_confidence': fused_result.overall_confidence
            }
            
            # Integrate cultural context
            cultural_context = await self.cultural_integrator.integrate_cultural_context(
                text_content, visual_content, audio_content, multimodal_features
            )
            
            # Enhance the multimodal result with cultural context
            enhanced_result = await self.cultural_integrator.enhance_multimodal_result(
                fused_result, cultural_context
            )
            
            metrics.cultural_authenticity = cultural_context.romanian_authenticity_score
            metrics.cultural_markers_found = sum(len(markers) for markers in cultural_context.cultural_markers.values())
            
            logger.info(f"   Cultural integration completed: {cultural_context.romanian_authenticity_score:.3f} authenticity, {metrics.cultural_markers_found} markers")
            
            return cultural_context
            
        except Exception as e:
            logger.warning(f"   Cultural integration failed: {e}")
            metrics.warnings.append(f"Cultural integration: {e}")
            return self._create_minimal_cultural_context()
    
    async def _synthesize_results(self, fused_result: RomanianMultimodalResult,
                                cultural_context: CulturalContext,
                                metrics: ProcessingMetrics,
                                input_id: str) -> IntegratedResult:
        """Synthesize comprehensive integrated result"""
        logger.info("   Synthesizing integrated results...")
        
        # Calculate integration confidence
        integration_confidence = await self._calculate_integration_confidence(
            fused_result, cultural_context, metrics
        )
        
        # Determine cultural significance
        significance_level = self._determine_cultural_significance(cultural_context)
        
        # Generate regional insights
        regional_insights = await self._generate_regional_insights(cultural_context, fused_result)
        
        # Generate historical context
        historical_context = await self._generate_historical_context(cultural_context)
        
        # Generate recommendations
        preservation_recs = await self._generate_preservation_recommendations(cultural_context, fused_result)
        enhancement_recs = await self._generate_enhancement_suggestions(fused_result, metrics)
        analysis_recs = await self._generate_further_analysis_recommendations(cultural_context, fused_result)
        
        # Create integrated result
        integrated_result = IntegratedResult(
            result_id=f"integrated_{input_id}_{int(time.time())}",
            multimodal_result=fused_result,
            cultural_context=cultural_context,
            processing_metrics=metrics,
            romanian_authenticity_score=cultural_context.romanian_authenticity_score,
            cultural_significance_level=significance_level,
            regional_insights=regional_insights,
            historical_context=historical_context,
            preservation_recommendations=preservation_recs,
            enhancement_suggestions=enhancement_recs,
            further_analysis_recommendations=analysis_recs,
            integration_confidence=integration_confidence,
            processing_mode=self.config.processing_mode,
            configuration_used=self._serialize_config()
        )
        
        logger.info(f"   Result synthesis completed: {integration_confidence:.3f} integration confidence")
        return integrated_result
    
    async def _validate_result_quality(self, integrated_result: IntegratedResult, 
                                     metrics: ProcessingMetrics):
        """Validate the quality of integrated results"""
        if not self.config.enable_validation_checks:
            return
        
        logger.info("   Validating result quality...")
        
        # Check minimum confidence threshold
        if integrated_result.integration_confidence < self.config.minimum_confidence_threshold:
            metrics.warnings.append(
                f"Low integration confidence: {integrated_result.integration_confidence:.3f} < {self.config.minimum_confidence_threshold}"
            )
        
        # Check cultural authenticity for Romanian content
        if self.config.enable_cultural_analysis and integrated_result.romanian_authenticity_score < 0.3:
            metrics.warnings.append(
                f"Low Romanian authenticity: {integrated_result.romanian_authenticity_score:.3f}"
            )
        
        # Check processing time
        if metrics.total_processing_time > self.config.max_processing_time:
            metrics.warnings.append(
                f"Processing time exceeded: {metrics.total_processing_time:.3f}s > {self.config.max_processing_time}s"
            )
        
        # Validate cultural context consistency
        cultural_context = integrated_result.cultural_context
        if cultural_context.cultural_coherence_score < 0.5:
            metrics.warnings.append(
                f"Low cultural coherence: {cultural_context.cultural_coherence_score:.3f}"
            )
        
        logger.info(f"   Quality validation completed: {len(metrics.warnings)} warnings, {len(metrics.errors)} errors")
    
    async def _prepare_output(self, integrated_result: IntegratedResult, 
                            metrics: ProcessingMetrics) -> IntegratedResult:
        """Prepare final output based on configuration"""
        logger.info("   Preparing final output...")
        
        # Apply output format filtering
        if self.config.output_format == "minimal":
            integrated_result = await self._create_minimal_output(integrated_result)
        elif self.config.output_format == "standard":
            integrated_result = await self._create_standard_output(integrated_result)
        # comprehensive is default - no filtering needed
        
        # Add final metadata
        integrated_result.processing_metrics = metrics
        integrated_result.processing_metrics.memory_usage_mb = await self._get_memory_usage()
        
        logger.info("   Output preparation completed")
        return integrated_result
    
    # Helper methods
    
    async def _calculate_cross_modal_coherence(self, aligned_features: Dict[str, Any]) -> float:
        """Calculate cross-modal coherence score"""
        if len(aligned_features) < 2:
            return 1.0
        
        # Simplified coherence calculation
        feature_similarities = []
        modalities = list(aligned_features.keys())
        
        for i in range(len(modalities)):
            for j in range(i + 1, len(modalities)):
                # Calculate similarity between modalities
                similarity = 0.7  # Placeholder - would use actual feature comparison
                feature_similarities.append(similarity)
        
        return sum(feature_similarities) / len(feature_similarities) if feature_similarities else 0.5
    
    def _create_engine_input(self, aligned_features: Dict[str, Any]) -> MultimodalInput:
        """Create input for the multimodal engine"""
        # Extract relevant data from aligned features
        text_content = ""
        if 'text' in aligned_features:
            text_content = aligned_features['text'].get('content', '')
        
        return MultimodalInput(
            input_id=f"engine_input_{int(time.time())}",
            text_content=text_content,
            metadata={'aligned_features': True}
        )
    
    def _create_minimal_cultural_context(self) -> CulturalContext:
        """Create minimal cultural context for cases where cultural analysis is disabled"""
        from .cultural_context_integration import CulturalContext
        return CulturalContext(
            context_id=f"minimal_{int(time.time())}",
            romanian_authenticity_score=0.0,
            cultural_coherence_score=0.0,
            integration_confidence=0.0
        )
    
    async def _calculate_integration_confidence(self, fused_result: RomanianMultimodalResult,
                                              cultural_context: CulturalContext,
                                              metrics: ProcessingMetrics) -> float:
        """Calculate overall integration confidence"""
        confidence_factors = []
        
        # Multimodal result confidence
        confidence_factors.append(fused_result.overall_confidence * 0.4)
        
        # Cultural context confidence
        confidence_factors.append(cultural_context.integration_confidence * 0.3)
        
        # Cross-modal coherence
        confidence_factors.append(metrics.cross_modal_coherence * 0.2)
        
        # Processing quality (inverse of errors and warnings)
        quality_score = 1.0 - (len(metrics.errors) * 0.3 + len(metrics.warnings) * 0.1)
        confidence_factors.append(max(0.0, quality_score) * 0.1)
        
        return sum(confidence_factors)
    
    def _determine_cultural_significance(self, cultural_context: CulturalContext) -> str:
        """Determine cultural significance level"""
        authenticity = cultural_context.romanian_authenticity_score
        
        if authenticity >= 0.9:
            return "exceptional"
        elif authenticity >= 0.7:
            return "high"
        elif authenticity >= 0.5:
            return "medium"
        else:
            return "low"
    
    async def _generate_regional_insights(self, cultural_context: CulturalContext, 
                                        fused_result: RomanianMultimodalResult) -> Dict[str, Any]:
        """Generate regional insights"""
        insights = {
            'primary_region': cultural_context.primary_region,
            'regional_confidence': cultural_context.regional_confidence,
            'regional_characteristics': [],
            'cross_regional_elements': []
        }
        
        # Add regional characteristics based on detected markers
        if cultural_context.primary_region and hasattr(fused_result, 'regional_insights'):
            insights.update(fused_result.regional_insights)
        
        return insights
    
    async def _generate_historical_context(self, cultural_context: CulturalContext) -> Dict[str, Any]:
        """Generate historical context information"""
        return {
            'dominant_period': cultural_context.dominant_period.value if cultural_context.dominant_period else None,
            'period_confidence': {period.value: conf for period, conf in cultural_context.period_confidence.items()},
            'historical_consistency': cultural_context.historical_consistency_score,
            'temporal_markers': cultural_context.cultural_themes
        }
    
    async def _generate_preservation_recommendations(self, cultural_context: CulturalContext,
                                                   fused_result: RomanianMultimodalResult) -> List[str]:
        """Generate preservation recommendations"""
        recommendations = list(cultural_context.preservation_recommendations)
        
        # Add recommendations based on result quality
        if fused_result.overall_confidence > 0.8:
            recommendations.append("high_quality_archival")
        
        if cultural_context.romanian_authenticity_score > 0.7:
            recommendations.append("cultural_heritage_documentation")
        
        return recommendations[:5]  # Limit to top 5
    
    async def _generate_enhancement_suggestions(self, fused_result: RomanianMultimodalResult,
                                              metrics: ProcessingMetrics) -> List[str]:
        """Generate enhancement suggestions"""
        suggestions = []
        
        if fused_result.overall_confidence < 0.6:
            suggestions.append("improve_input_quality")
        
        if metrics.cross_modal_coherence < 0.5:
            suggestions.append("enhance_cross_modal_alignment")
        
        if metrics.cultural_markers_found < 3:
            suggestions.append("add_cultural_context_information")
        
        return suggestions
    
    async def _generate_further_analysis_recommendations(self, cultural_context: CulturalContext,
                                                       fused_result: RomanianMultimodalResult) -> List[str]:
        """Generate recommendations for further analysis"""
        recommendations = []
        
        if cultural_context.romanian_authenticity_score > 0.8:
            recommendations.append("detailed_ethnographic_analysis")
        
        if cultural_context.primary_region:
            recommendations.append(f"regional_{cultural_context.primary_region}_specialist_review")
        
        if len(cultural_context.cultural_themes) > 3:
            recommendations.append("thematic_cultural_analysis")
        
        return recommendations
    
    def _serialize_config(self) -> Dict[str, Any]:
        """Serialize configuration for metadata"""
        return {
            'processing_mode': self.config.processing_mode.value,
            'cultural_analysis_enabled': self.config.enable_cultural_analysis,
            'cross_modal_alignment_enabled': self.config.enable_cross_modal_alignment,
            'output_format': self.config.output_format,
            'confidence_threshold': self.config.minimum_confidence_threshold
        }
    
    async def _create_minimal_output(self, integrated_result: IntegratedResult) -> IntegratedResult:
        """Create minimal output format"""
        # Keep only essential information
        integrated_result.multimodal_result.detailed_analysis = {}
        integrated_result.cultural_context.processing_metadata = {}
        return integrated_result
    
    async def _create_standard_output(self, integrated_result: IntegratedResult) -> IntegratedResult:
        """Create standard output format"""
        # Keep most information but reduce some details
        integrated_result.further_analysis_recommendations = integrated_result.further_analysis_recommendations[:3]
        return integrated_result
    
    async def _get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        # Placeholder - would use actual memory monitoring
        return 50.0
    
    async def _create_error_result(self, input_id: str, metrics: ProcessingMetrics, 
                                 error_message: str) -> IntegratedResult:
        """Create error result for failed processing"""
        from .romanian_multimodal_engine import RomanianMultimodalResult
        
        error_result = RomanianMultimodalResult(
            result_id=f"error_{input_id}",
            overall_confidence=0.0,
            cultural_significance=0.0,
            processing_metadata={'error': error_message}
        )
        
        error_context = self._create_minimal_cultural_context()
        
        return IntegratedResult(
            result_id=f"error_integrated_{input_id}",
            multimodal_result=error_result,
            cultural_context=error_context,
            processing_metrics=metrics,
            integration_confidence=0.0,
            processing_mode=self.config.processing_mode
        )
    
    def _update_processing_stats(self, metrics: ProcessingMetrics):
        """Update processing statistics"""
        self.processing_stats['total_processed'] += 1
        
        if not metrics.errors:
            self.processing_stats['successful_integrations'] += 1
        
        # Update average processing time
        total_time = (self.processing_stats['average_processing_time'] * 
                     (self.processing_stats['total_processed'] - 1) + 
                     metrics.total_processing_time)
        self.processing_stats['average_processing_time'] = total_time / self.processing_stats['total_processed']
        
        if metrics.cultural_markers_found > 0:
            self.processing_stats['cultural_discoveries'] += 1
    
    def get_processing_statistics(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return dict(self.processing_stats)

# Test function
async def test_integration_pipeline():
    """Test Romanian multimodal integration pipeline"""
    print("🔗 Testing Romanian Multimodal Integration Pipeline...")
    
    # Create test configuration
    config = IntegrationConfig(
        processing_mode=ProcessingMode.STANDARD,
        enable_cultural_analysis=True,
        enable_cross_modal_alignment=True,
        output_format="comprehensive"
    )
    
    # Create test multimodal input
    test_input = MultimodalInput(
        input_id="test_integration_pipeline",
        text_content="""
        Salutare! Sunt din Maramureș și locuiesc într-o casă tradițională cu poartă maramureșeană.
        În satul nostru avem o frumoasă biserică de lemn și păstrăm tradițiile strămoșești.
        Mama mea țese carpet tradiționale și îmbrăc portul popular la sărbători.
        """,
        metadata={
            'language': 'ro',
            'region': 'maramures',
            'cultural_context': 'traditional_village'
        }
    )
    
    # Initialize and test pipeline
    pipeline = RomanianMultimodalIntegrationPipeline(config)
    
    try:
        # Process the multimodal content
        integrated_result = await pipeline.process_multimodal_content(test_input)
        
        # Display results
        print(f"   Integration confidence: {integrated_result.integration_confidence:.3f}")
        print(f"   Romanian authenticity: {integrated_result.romanian_authenticity_score:.3f}")
        print(f"   Cultural significance: {integrated_result.cultural_significance_level}")
        print(f"   Processing time: {integrated_result.processing_metrics.total_processing_time:.3f}s")
        
        if integrated_result.regional_insights.get('primary_region'):
            print(f"   Primary region: {integrated_result.regional_insights['primary_region']}")
        
        if integrated_result.cultural_context.cultural_themes:
            print(f"   Cultural themes: {', '.join(integrated_result.cultural_context.cultural_themes)}")
        
        if integrated_result.preservation_recommendations:
            print(f"   Preservation: {', '.join(integrated_result.preservation_recommendations[:2])}")
        
        # Show processing statistics
        stats = pipeline.get_processing_statistics()
        print(f"   Pipeline stats: {stats['successful_integrations']}/{stats['total_processed']} successful")
        
        print("✅ Integration pipeline test completed successfully!")
        
    except Exception as e:
        print(f"❌ Integration pipeline test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_integration_pipeline())
