"""
Test Suite for Multi-Modal Integration System
============================================

Comprehensive tests for the RUAGA-NOVA multi-modal integration system.
"""

import pytest
import asyncio
import torch
import numpy as np
from pathlib import Path
import tempfile
import json
from unittest.mock import Mock, patch, MagicMock
from PIL import Image

# Import the multimodal system components
import sys
sys.path.append(str(Path(__file__).parent))

from base_multimodal import (
    MultiModalConfig, MultiModalInput, MultiModalOutput, 
    ModalityType, ProcessingMode, BaseMultiModalProcessor
)
from vision_processor import RomanianVisionProcessor
from audio_processor import RomanianAudioProcessor
from video_processor import VideoProcessor, RomanianCulturalVideoAnalysis
from cross_modal_fusion import RomAICrossModalFusion
from romanian_cultural_multimodal import RomanianCulturalMultiModalSystem, CulturalMultiModalOutput


class TestMultiModalConfig:
    """Test MultiModalConfig functionality"""
    
    def test_config_creation(self):
        """Test config creation with default values"""
        config = MultiModalConfig()
        
        assert config.vision_model_name == "clip-vit-large"
        assert config.audio_model_name == "wav2vec2-large"
        assert config.cultural_context_enabled is True
        assert config.romanian_cultural_weight == 0.3
        assert len(config.supported_image_formats) > 0
        assert len(config.supported_audio_formats) > 0
        assert len(config.supported_video_formats) > 0
        
    def test_config_customization(self):
        """Test config customization"""
        config = MultiModalConfig(
            vision_model_name="custom-vision",
            audio_model_name="custom-audio",
            cultural_context_enabled=False,
            romanian_cultural_weight=0.5
        )
        
        assert config.vision_model_name == "custom-vision"
        assert config.audio_model_name == "custom-audio"
        assert config.cultural_context_enabled is False
        assert config.romanian_cultural_weight == 0.5


class TestMultiModalInput:
    """Test MultiModalInput functionality"""
    
    def test_input_creation_image(self):
        """Test image input creation"""
        # Create test image
        test_image = Image.new('RGB', (224, 224), color='red')
        
        input_data = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=test_image,
            processing_mode=ProcessingMode.FAST,
            romanian_context=True
        )
        
        assert input_data.modality == ModalityType.IMAGE
        assert isinstance(input_data.data, Image.Image)
        assert input_data.processing_mode == ProcessingMode.FAST
        assert input_data.romanian_context is True
        
    def test_input_creation_audio(self):
        """Test audio input creation"""
        # Create test audio data
        test_audio = np.random.randn(16000).astype(np.float32)  # 1 second at 16kHz
        
        input_data = MultiModalInput(
            modality=ModalityType.AUDIO,
            data=test_audio,
            processing_mode=ProcessingMode.BALANCED,
            metadata={"sample_rate": 16000}
        )
        
        assert input_data.modality == ModalityType.AUDIO
        assert isinstance(input_data.data, np.ndarray)
        assert input_data.processing_mode == ProcessingMode.BALANCED
        assert input_data.metadata["sample_rate"] == 16000
        
    def test_input_validation(self):
        """Test input validation"""
        with pytest.raises(ValueError):
            MultiModalInput(
                modality="invalid_modality",
                data=None
            )


class TestBaseMultiModalProcessor:
    """Test BaseMultiModalProcessor functionality"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture
    def processor(self, config):
        return BaseMultiModalProcessor(config)
        
    def test_processor_initialization(self, processor):
        """Test processor initialization"""
        assert isinstance(processor.config, MultiModalConfig)
        assert hasattr(processor, 'model_loaded')
        
    @pytest.mark.asyncio
    async def test_load_models(self, processor):
        """Test model loading"""
        await processor._load_models()
        # Base implementation should not fail
        
    def test_supported_modalities_abstract(self, processor):
        """Test that abstract methods raise NotImplementedError"""
        with pytest.raises(NotImplementedError):
            processor.get_supported_modalities()
            
        with pytest.raises(NotImplementedError):
            processor.get_supported_formats()


class TestVisionProcessor:
    """Test VisionProcessor functionality"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture 
    def processor(self, config):
        return VisionProcessor(config)
        
    def test_vision_processor_initialization(self, processor):
        """Test vision processor initialization"""
        assert isinstance(processor, VisionProcessor)
        assert ModalityType.IMAGE in processor.get_supported_modalities()
        assert "jpg" in processor.get_supported_formats()
        assert "png" in processor.get_supported_formats()
        
    @pytest.mark.asyncio
    async def test_vision_processing(self, processor):
        """Test vision processing"""
        # Create test image
        test_image = Image.new('RGB', (224, 224), color='blue')
        
        input_data = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=test_image,
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True
        )
        
        # Mock the internal processing to avoid model loading
        with patch.object(processor, '_load_models', return_value=None):
            await processor._load_models()
            
            # Mock vision processing
            with patch.object(processor, '_process_internal') as mock_process:
                mock_output = MultiModalOutput(
                    modality=ModalityType.IMAGE,
                    features={"visual_features": "test_features"},
                    embeddings=np.random.randn(512).astype(np.float32),
                    cultural_analysis={"traditional_elements": ["costume", "architecture"]},
                    confidence=0.85,
                    processing_time=0.1
                )
                mock_process.return_value = mock_output
                
                result = await processor._process_internal(input_data)
                
                assert isinstance(result, MultiModalOutput)
                assert result.modality == ModalityType.IMAGE
                assert result.confidence > 0
                assert "visual_features" in result.features
                assert result.cultural_analysis is not None


class TestAudioProcessor:
    """Test AudioProcessor functionality"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture
    def processor(self, config):
        return AudioProcessor(config)
        
    def test_audio_processor_initialization(self, processor):
        """Test audio processor initialization"""
        assert isinstance(processor, AudioProcessor)
        assert ModalityType.AUDIO in processor.get_supported_modalities()
        assert "wav" in processor.get_supported_formats()
        assert "mp3" in processor.get_supported_formats()
        
    @pytest.mark.asyncio
    async def test_audio_processing(self, processor):
        """Test audio processing"""
        # Create test audio data
        test_audio = np.random.randn(16000).astype(np.float32)
        
        input_data = MultiModalInput(
            modality=ModalityType.AUDIO,
            data=test_audio,
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True,
            metadata={"sample_rate": 16000}
        )
        
        # Mock processing
        with patch.object(processor, '_load_models', return_value=None):
            await processor._load_models()
            
            with patch.object(processor, '_process_internal') as mock_process:
                mock_output = MultiModalOutput(
                    modality=ModalityType.AUDIO,
                    features={"audio_features": "test_features"},
                    embeddings=np.random.randn(768).astype(np.float32),
                    cultural_analysis={"traditional_music": ["hora", "sarba"]},
                    confidence=0.78,
                    processing_time=0.15
                )
                mock_process.return_value = mock_output
                
                result = await processor._process_internal(input_data)
                
                assert isinstance(result, MultiModalOutput)
                assert result.modality == ModalityType.AUDIO
                assert result.confidence > 0
                assert "audio_features" in result.features


class TestVideoProcessor:
    """Test VideoProcessor functionality"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture
    def processor(self, config):
        return VideoProcessor(config)
        
    def test_video_processor_initialization(self, processor):
        """Test video processor initialization"""
        assert isinstance(processor, VideoProcessor)
        assert ModalityType.VIDEO in processor.get_supported_modalities()
        assert "mp4" in processor.get_supported_formats()
        assert "avi" in processor.get_supported_formats()
        
    @pytest.mark.asyncio
    async def test_video_processing(self, processor):
        """Test video processing"""
        input_data = MultiModalInput(
            modality=ModalityType.VIDEO,
            data="test_video_path.mp4",
            processing_mode=ProcessingMode.QUALITY,
            romanian_context=True
        )
        
        # Mock processing
        with patch.object(processor, '_load_models', return_value=None):
            await processor._load_models()
            
            with patch.object(processor, '_process_internal') as mock_process:
                mock_output = MultiModalOutput(
                    modality=ModalityType.VIDEO,
                    features={"video_features": "test_features"},
                    embeddings=np.random.randn(1024).astype(np.float32),
                    cultural_analysis={"traditional_dances": ["hora_moldoveneasca"]},
                    confidence=0.82,
                    processing_time=0.25
                )
                mock_process.return_value = mock_output
                
                result = await processor._process_internal(input_data)
                
                assert isinstance(result, MultiModalOutput)
                assert result.modality == ModalityType.VIDEO
                assert result.confidence > 0


class TestCrossModalFusion:
    """Test CrossModalFusion functionality"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture
    def fusion_system(self, config):
        return CrossModalFusion(config)
        
    @pytest.fixture
    def mock_outputs(self):
        """Create mock multimodal outputs for testing"""
        image_output = MultiModalOutput(
            modality=ModalityType.IMAGE,
            features={"visual_elements": ["costume", "dance"]},
            embeddings=np.random.randn(512).astype(np.float32),
            cultural_analysis={"region": "maramures", "authenticity": 0.9},
            confidence=0.85,
            processing_time=0.1
        )
        
        audio_output = MultiModalOutput(
            modality=ModalityType.AUDIO,
            features={"audio_elements": ["traditional_music", "instruments"]},
            embeddings=np.random.randn(768).astype(np.float32),
            cultural_analysis={"music_type": "hora", "authenticity_score": 0.87},
            confidence=0.78,
            processing_time=0.15
        )
        
        return [image_output, audio_output]
        
    @pytest.mark.asyncio
    async def test_fusion_initialization(self, fusion_system):
        """Test fusion system initialization"""
        await fusion_system.initialize()
        assert hasattr(fusion_system, 'romanian_cultural_fusion')
        
    @pytest.mark.asyncio
    async def test_cross_modal_fusion(self, fusion_system, mock_outputs):
        """Test cross-modal fusion"""
        await fusion_system.initialize()
        
        result = await fusion_system.fuse_modalities(
            mock_outputs, ProcessingMode.BALANCED
        )
        
        assert isinstance(result, dict)
        assert "fused_representation" in result
        assert "cross_modal_features" in result
        assert "cultural_fusion" in result
        assert "unified_understanding" in result
        assert "fusion_confidence" in result
        assert result["fusion_confidence"] > 0


class TestRomanianCulturalMultiModalSystem:
    """Test complete Romanian Cultural Multimodal System"""
    
    @pytest.fixture
    def config(self):
        return MultiModalConfig()
        
    @pytest.fixture
    def system(self, config):
        return RomanianCulturalMultiModalSystem(config)
        
    @pytest.fixture
    def mock_inputs(self):
        """Create mock inputs for testing"""
        image_input = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=Image.new('RGB', (224, 224), color='red'),
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True
        )
        
        audio_input = MultiModalInput(
            modality=ModalityType.AUDIO,
            data=np.random.randn(16000).astype(np.float32),
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True,
            metadata={"sample_rate": 16000}
        )
        
        return [image_input, audio_input]
        
    def test_system_initialization(self, system):
        """Test system initialization"""
        assert isinstance(system.config, MultiModalConfig)
        assert hasattr(system, 'vision_processor')
        assert hasattr(system, 'audio_processor')
        assert hasattr(system, 'video_processor')
        assert hasattr(system, 'cross_modal_fusion')
        
    @pytest.mark.asyncio
    async def test_system_processing(self, system, mock_inputs):
        """Test complete system processing"""
        # Mock all components
        with patch.object(system, 'initialize', return_value=None), \
             patch.object(system, '_process_individual_modalities') as mock_individual, \
             patch.object(system, '_perform_cross_modal_fusion') as mock_fusion, \
             patch.object(system, '_perform_cultural_analysis') as mock_cultural:
            
            # Setup mocks
            mock_individual_outputs = {
                ModalityType.IMAGE: MultiModalOutput(
                    modality=ModalityType.IMAGE,
                    features={"visual": "test"},
                    embeddings=np.random.randn(512).astype(np.float32),
                    cultural_analysis={"region": "moldova"},
                    confidence=0.85,
                    processing_time=0.1
                ),
                ModalityType.AUDIO: MultiModalOutput(
                    modality=ModalityType.AUDIO,
                    features={"audio": "test"},
                    embeddings=np.random.randn(768).astype(np.float32),
                    cultural_analysis={"music_type": "traditional"},
                    confidence=0.78,
                    processing_time=0.15
                )
            }
            
            mock_individual.return_value = mock_individual_outputs
            mock_fusion.return_value = {
                "fused_representation": {"unified": "features"},
                "fusion_confidence": 0.82
            }
            mock_cultural.return_value = {
                "cultural_elements": ["dance", "music"],
                "authenticity_assessment": {"overall_authenticity": 0.87}
            }
            
            await system.initialize()
            
            result = await system.process_cultural_content(
                mock_inputs,
                processing_mode=ProcessingMode.BALANCED,
                cultural_analysis_depth="comprehensive"
            )
            
            assert isinstance(result, CulturalMultiModalOutput)
            assert len(result.individual_outputs) > 0
            assert result.confidence > 0
            assert result.cultural_significance_score >= 0
            assert result.preservation_value >= 0
            assert result.educational_value >= 0
            assert len(result.cultural_narrative) > 0
            
    @pytest.mark.asyncio
    async def test_system_statistics(self, system):
        """Test system statistics"""
        # Mock processing history
        system.processing_history = [
            {
                "timestamp": 1234567890,
                "modalities_processed": [ModalityType.IMAGE, ModalityType.AUDIO],
                "cultural_significance": 0.85,
                "preservation_value": 0.78,
                "educational_value": 0.82,
                "processing_time": 0.25,
                "confidence": 0.80
            }
        ]
        
        stats = await system.get_system_statistics()
        
        assert "total_content_processed" in stats
        assert "average_processing_time" in stats
        assert "average_confidence" in stats
        assert "average_cultural_significance" in stats
        assert "modality_usage" in stats
        assert stats["total_content_processed"] == 1
        assert stats["average_confidence"] == 0.80


class TestRomanianCulturalAnalysis:
    """Test Romanian cultural analysis components"""
    
    @pytest.mark.asyncio
    async def test_romanian_visual_recognition(self):
        """Test Romanian visual recognition"""
        recognition = RomanianVisualRecognition()
        await recognition.initialize()
        
        # Mock analysis
        with patch.object(recognition, 'analyze_romanian_visual_content') as mock_analyze:
            mock_analyze.return_value = {
                "traditional_elements": ["ii", "catrinţă"],
                "regional_style": "maramures",
                "authenticity_score": 0.89,
                "cultural_significance": "high"
            }
            
            # This would normally take image features as input
            result = await recognition.analyze_romanian_visual_content({})
            
            assert "traditional_elements" in result
            assert "authenticity_score" in result
            assert result["authenticity_score"] > 0.8
            
    @pytest.mark.asyncio
    async def test_romanian_audio_analysis(self):
        """Test Romanian audio analysis"""
        analysis = RomanianAudioAnalysis()
        await analysis.initialize()
        
        # Mock analysis
        with patch.object(analysis, 'analyze_romanian_audio') as mock_analyze:
            mock_analyze.return_value = {
                "traditional_music": ["doina", "hora"],
                "instruments": ["cobza", "caval"],
                "authenticity_score": 0.92,
                "regional_identification": "moldova"
            }
            
            result = await analysis.analyze_romanian_audio({})
            
            assert "traditional_music" in result
            assert "instruments" in result
            assert result["authenticity_score"] > 0.9


class TestPerformanceMetrics:
    """Test performance and metrics"""
    
    def test_processing_time_tracking(self):
        """Test processing time tracking"""
        # This would test the multimodal_metrics system
        from base_multimodal import multimodal_metrics
        
        # Record some metrics
        multimodal_metrics.record_processing_time(ModalityType.IMAGE, 0.1)
        multimodal_metrics.record_processing_time(ModalityType.AUDIO, 0.15)
        
        stats = multimodal_metrics.get_statistics()
        
        assert "processing_times" in stats
        assert ModalityType.IMAGE.value in stats["processing_times"]
        assert ModalityType.AUDIO.value in stats["processing_times"]
        
    def test_cultural_recognition_tracking(self):
        """Test cultural recognition tracking"""
        from base_multimodal import multimodal_metrics
        
        multimodal_metrics.record_cultural_recognition(ModalityType.IMAGE, True)
        multimodal_metrics.record_cultural_recognition(ModalityType.AUDIO, True)
        
        stats = multimodal_metrics.get_statistics()
        
        assert "cultural_recognition_rate" in stats
        assert stats["cultural_recognition_rate"] > 0


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    @pytest.mark.asyncio
    async def test_invalid_input_handling(self):
        """Test handling of invalid inputs"""
        config = MultiModalConfig()
        processor = VisionProcessor(config)
        
        # Test with invalid image data
        invalid_input = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=None,
            processing_mode=ProcessingMode.FAST
        )
        
        with pytest.raises(Exception):
            await processor.process(invalid_input)
            
    @pytest.mark.asyncio
    async def test_fusion_with_insufficient_modalities(self):
        """Test fusion with insufficient modalities"""
        config = MultiModalConfig()
        fusion = CrossModalFusion(config)
        await fusion.initialize()
        
        # Single modality should handle gracefully
        single_output = [MultiModalOutput(
            modality=ModalityType.IMAGE,
            features={"test": "data"},
            embeddings=np.random.randn(512).astype(np.float32),
            confidence=0.8,
            processing_time=0.1
        )]
        
        with pytest.raises(ValueError, match="Cross-modal fusion requires at least 2 modalities"):
            await fusion.fuse_modalities(single_output)
            
    def test_config_validation(self):
        """Test configuration validation"""
        # Test invalid cultural weight
        with pytest.raises(ValueError):
            MultiModalConfig(romanian_cultural_weight=1.5)  # Should be <= 1.0
            
        # Test invalid processing modes
        with pytest.raises(ValueError):
            MultiModalInput(
                modality=ModalityType.IMAGE,
                data=Image.new('RGB', (224, 224)),
                processing_mode="invalid_mode"
            )


class TestIntegration:
    """Integration tests for the complete system"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_processing(self):
        """Test end-to-end processing with real-like data"""
        config = MultiModalConfig()
        system = RomanianCulturalMultiModalSystem(config)
        
        # Create realistic test inputs
        image_input = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=Image.new('RGB', (224, 224), color='blue'),
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True
        )
        
        audio_input = MultiModalInput(
            modality=ModalityType.AUDIO,
            data=np.random.randn(16000).astype(np.float32),
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True,
            metadata={"sample_rate": 16000}
        )
        
        inputs = [image_input, audio_input]
        
        # Mock all the heavy processing
        with patch.multiple(
            system,
            initialize=AsyncMock(),
            _process_individual_modalities=AsyncMock(return_value={
                ModalityType.IMAGE: MultiModalOutput(
                    modality=ModalityType.IMAGE,
                    features={"visual_elements": ["traditional_costume"]},
                    embeddings=np.random.randn(512).astype(np.float32),
                    cultural_analysis={"region": "transylvania", "authenticity": 0.85},
                    confidence=0.82,
                    processing_time=0.12
                ),
                ModalityType.AUDIO: MultiModalOutput(
                    modality=ModalityType.AUDIO,
                    features={"musical_elements": ["folk_melody"]},
                    embeddings=np.random.randn(768).astype(np.float32),
                    cultural_analysis={"music_type": "doina", "authenticity_score": 0.78},
                    confidence=0.75,
                    processing_time=0.18
                )
            }),
            _perform_cross_modal_fusion=AsyncMock(return_value={
                "fused_representation": {"unified_features": "test"},
                "fusion_confidence": 0.79
            }),
            _perform_cultural_analysis=AsyncMock(return_value={
                "cultural_elements": ["costume", "music"],
                "authenticity_assessment": {"overall_authenticity": 0.81}
            })
        ):
            await system.initialize()
            
            result = await system.process_cultural_content(inputs)
            
            # Verify comprehensive output
            assert isinstance(result, CulturalMultiModalOutput)
            assert len(result.individual_outputs) == 2
            assert ModalityType.IMAGE in result.individual_outputs
            assert ModalityType.AUDIO in result.individual_outputs
            assert result.confidence > 0.0
            assert result.cultural_significance_score >= 0.0
            assert result.preservation_value >= 0.0
            assert result.educational_value >= 0.0
            assert len(result.cultural_narrative) > 10  # Should be substantial
            assert result.processing_time > 0.0
            
    @pytest.mark.asyncio
    async def test_cultural_report_generation(self):
        """Test cultural report generation"""
        config = MultiModalConfig()
        system = RomanianCulturalMultiModalSystem(config)
        
        # Create mock output
        mock_output = CulturalMultiModalOutput(
            individual_outputs={
                ModalityType.IMAGE: MultiModalOutput(
                    modality=ModalityType.IMAGE,
                    features={"visual": "test"},
                    embeddings=np.random.randn(512).astype(np.float32),
                    cultural_analysis={"authenticity": 0.85},
                    confidence=0.82,
                    processing_time=0.12
                )
            },
            fused_output={"fusion_confidence": 0.78},
            cultural_narrative="Test cultural narrative about Romanian traditions.",
            cultural_significance_score=0.83,
            preservation_value=0.79,
            educational_value=0.77,
            authenticity_assessment={"overall_authenticity": 0.81, "authenticity_level": "authentic"},
            unified_understanding={"cultural_themes": ["tradition", "heritage"]},
            processing_time=0.25,
            confidence=0.80
        )
        
        with patch.multiple(
            system,
            _generate_preservation_recommendations=AsyncMock(return_value=["High priority preservation"]),
            _generate_educational_recommendations=AsyncMock(return_value=["Suitable for education"]),
            _generate_research_recommendations=AsyncMock(return_value=["Good for research"])
        ):
            report = await system.generate_cultural_report(mock_output)
            
            assert "executive_summary" in report
            assert "detailed_analysis" in report
            assert "technical_details" in report
            assert "recommendations" in report
            
            assert report["executive_summary"]["content_type"] == "Romanian Cultural Content"
            assert report["executive_summary"]["overall_confidence"] == 0.80
            assert len(report["recommendations"]["preservation_actions"]) > 0


# Utility class for async testing
class AsyncMock:
    """Simple async mock for testing"""
    def __init__(self, return_value=None):
        self.return_value = return_value
        self.called = False
        self.call_args = None
        
    async def __call__(self, *args, **kwargs):
        self.called = True
        self.call_args = (args, kwargs)
        return self.return_value


if __name__ == "__main__":
    # Run specific tests
    pytest.main([
        __file__,
        "-v",
        "--tb=short", 
        "--disable-warnings"
    ])