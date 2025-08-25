"""
Simple Multi-Modal Integration Test
===================================

Focused tests for the core multi-modal components that exist.
"""

import pytest
import asyncio
import torch
import numpy as np
import tempfile
import json
from pathlib import Path
from PIL import Image
import time
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """Test that all multimodal components can be imported"""
    print("\n🔍 Testing component imports...")
    
    try:
        # Test base components
        from base_multimodal import (
            MultiModalConfig, MultiModalInput, MultiModalOutput, 
            ModalityType, ProcessingMode, BaseMultiModalProcessor
        )
        print("✅ Base multimodal components imported successfully")
        
        # Test vision processor
        from vision_processor import RomanianVisionProcessor
        print("✅ Romanian vision processor imported successfully")
        
        # Test audio processor 
        from audio_processor import RomanianAudioProcessor
        print("✅ Romanian audio processor imported successfully")
        
        # Test video processor
        from video_processor import VideoProcessor
        print("✅ Video processor imported successfully")
        
        # Test cross modal fusion
        from cross_modal_fusion import RomAICrossModalFusion
        print("✅ Cross-modal fusion imported successfully")
        
        # Test Romanian cultural system
        from romanian_cultural_multimodal import RomanianCulturalMultiModalSystem
        print("✅ Romanian cultural system imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import failed: {str(e)}")
        return False

def test_config_creation():
    """Test MultiModalConfig creation"""
    print("\n⚙️ Testing configuration creation...")
    
    try:
        from base_multimodal import MultiModalConfig
        
        # Test default config
        config = MultiModalConfig()
        print(f"   ✅ Default config created: vision_model={config.vision_model_name}")
        
        # Test custom config
        custom_config = MultiModalConfig(
            vision_model_name="custom-vision",
            romanian_cultural_weight=0.7
        )
        print(f"   ✅ Custom config created: weight={custom_config.romanian_cultural_weight}")
        
        return True
    except Exception as e:
        print(f"   ❌ Config creation failed: {str(e)}")
        return False

def test_modal_input_creation():
    """Test MultiModalInput creation"""
    print("\n📋 Testing input creation...")
    
    try:
        from base_multimodal import MultiModalInput, ModalityType, ProcessingMode
        
        # Test image input
        test_image = Image.new('RGB', (224, 224), color='blue')
        image_input = MultiModalInput(
            modality=ModalityType.IMAGE,
            data=test_image,
            processing_mode=ProcessingMode.BALANCED,
            romanian_context=True
        )
        print(f"   ✅ Image input created: {image_input.modality.value}")
        
        # Test audio input
        test_audio = np.random.randn(16000).astype(np.float32)
        audio_input = MultiModalInput(
            modality=ModalityType.AUDIO,
            data=test_audio,
            processing_mode=ProcessingMode.FAST,
            metadata={"sample_rate": 16000}
        )
        print(f"   ✅ Audio input created: shape={test_audio.shape}")
        
        # Test text input
        text_input = MultiModalInput(
            modality=ModalityType.TEXT,
            data="Salut! Aceasta este o propoziție românească.",
            processing_mode=ProcessingMode.QUALITY,
            romanian_context=True
        )
        print(f"   ✅ Text input created: {len(text_input.data)} characters")
        
        return True
    except Exception as e:
        print(f"   ❌ Input creation failed: {str(e)}")
        return False

def test_vision_processor_initialization():
    """Test vision processor initialization"""
    print("\n🖼️ Testing vision processor...")
    
    try:
        from vision_processor import RomanianVisionProcessor, VisionTaskType
        
        # Initialize processor
        processor = RomanianVisionProcessor()
        print("   ✅ Vision processor initialized")
        
        # Test with sample image
        test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Process image
        result = processor.process_image(test_image, VisionTaskType.IMAGE_CLASSIFICATION)
        
        print(f"   ✅ Image processed: confidence={result.confidence:.2f}")
        print(f"   ✅ Cultural significance: {result.cultural_significance:.2f}")
        print(f"   ✅ Romanian elements: {len(result.romanian_elements)}")
        
        return True
    except Exception as e:
        print(f"   ❌ Vision processor test failed: {str(e)}")
        return False

def test_audio_processor_initialization():
    """Test audio processor initialization"""
    print("\n🎵 Testing audio processor...")
    
    try:
        from audio_processor import RomanianAudioProcessor, AudioTaskType
        
        # Initialize processor
        processor = RomanianAudioProcessor()
        print("   ✅ Audio processor initialized")
        
        # Test with sample audio
        sample_rate = 16000
        duration = 1.0  # 1 second
        test_audio = np.random.randn(int(sample_rate * duration)).astype(np.float32)
        
        # Process audio
        result = processor.process_audio(test_audio, AudioTaskType.LANGUAGE_DETECTION, sample_rate)
        
        print(f"   ✅ Audio processed: confidence={result.confidence:.2f}")
        print(f"   ✅ Cultural significance: {result.cultural_significance:.2f}")
        print(f"   ✅ Romanian elements: {len(result.romanian_elements)}")
        
        return True
    except Exception as e:
        print(f"   ❌ Audio processor test failed: {str(e)}")
        return False

def test_video_processor_initialization():
    """Test video processor initialization"""
    print("\n🎬 Testing video processor...")
    
    try:
        from video_processor import VideoProcessor
        from base_multimodal import MultiModalConfig
        
        config = MultiModalConfig()
        processor = VideoProcessor(config)
        print("   ✅ Video processor initialized")
        
        # Test supported formats
        formats = processor.get_supported_formats()
        print(f"   ✅ Supported formats: {formats}")
        
        modalities = processor.get_supported_modalities()
        print(f"   ✅ Supported modalities: {[m.value for m in modalities]}")
        
        return True
    except Exception as e:
        print(f"   ❌ Video processor test failed: {str(e)}")
        return False

def test_cross_modal_fusion():
    """Test cross-modal fusion system"""
    print("\n🔗 Testing cross-modal fusion...")
    
    try:
        from cross_modal_fusion import RomAICrossModalFusion, MultimodalConfig
        
        # Create config
        config = MultimodalConfig()
        
        # Initialize fusion system
        fusion_system = RomAICrossModalFusion(config)
        print("   ✅ Cross-modal fusion system initialized")
        
        # Test model components
        print(f"   ✅ Model hidden size: {fusion_system.hidden_size}")
        print(f"   ✅ Number of layers: {fusion_system.num_layers}")
        print(f"   ✅ Cultural fusion enabled: {hasattr(fusion_system, 'cultural_fusion')}")
        
        return True
    except Exception as e:
        print(f"   ❌ Cross-modal fusion test failed: {str(e)}")
        return False

def test_romanian_cultural_system():
    """Test Romanian cultural multimodal system"""
    print("\n🏛️ Testing Romanian cultural system...")
    
    try:
        from romanian_cultural_multimodal import RomanianCulturalMultiModalSystem
        from base_multimodal import MultiModalConfig
        
        config = MultiModalConfig()
        system = RomanianCulturalMultiModalSystem(config)
        print("   ✅ Romanian cultural system initialized")
        
        # Check components
        print(f"   ✅ Vision processor: {hasattr(system, 'vision_processor')}")
        print(f"   ✅ Audio processor: {hasattr(system, 'audio_processor')}")
        print(f"   ✅ Video processor: {hasattr(system, 'video_processor')}")
        print(f"   ✅ Cross-modal fusion: {hasattr(system, 'cross_modal_fusion')}")
        
        return True
    except Exception as e:
        print(f"   ❌ Romanian cultural system test failed: {str(e)}")
        return False

def test_enums_and_types():
    """Test enum definitions and types"""
    print("\n📝 Testing enums and types...")
    
    try:
        from base_multimodal import ModalityType, ProcessingMode
        
        print(f"   ✅ Modality types: {[m.value for m in ModalityType]}")
        print(f"   ✅ Processing modes: {[m.value for m in ProcessingMode]}")
        
        from vision_processor import VisionTaskType, RomanianCulturalCategory
        print(f"   ✅ Vision task types: {len(list(VisionTaskType))}")
        print(f"   ✅ Cultural categories: {len(list(RomanianCulturalCategory))}")
        
        from audio_processor import AudioTaskType, RomanianAudioCategory
        print(f"   ✅ Audio task types: {len(list(AudioTaskType))}")
        print(f"   ✅ Audio categories: {len(list(RomanianAudioCategory))}")
        
        return True
    except Exception as e:
        print(f"   ❌ Enum testing failed: {str(e)}")
        return False

def test_performance_metrics():
    """Test performance tracking"""
    print("\n⚡ Testing performance metrics...")
    
    try:
        from base_multimodal import multimodal_metrics, ModalityType
        
        # Record some test metrics
        multimodal_metrics.record_processing_time(ModalityType.IMAGE, 0.15)
        multimodal_metrics.record_processing_time(ModalityType.AUDIO, 0.22)
        multimodal_metrics.record_cultural_recognition(ModalityType.IMAGE, True)
        multimodal_metrics.record_cultural_recognition(ModalityType.AUDIO, True)
        
        # Get statistics
        stats = multimodal_metrics.get_statistics()
        print(f"   ✅ Processing times recorded: {len(stats.get('processing_times', {}))}")
        print(f"   ✅ Cultural recognition rate: {stats.get('cultural_recognition_rate', 0):.2f}")
        print(f"   ✅ Total processed: {stats.get('total_processed', 0)}")
        
        return True
    except Exception as e:
        print(f"   ❌ Performance metrics test failed: {str(e)}")
        return False

def run_integration_test():
    """Run complete integration test"""
    print("\n🚀 Running Multi-Modal Integration Test Suite")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_config_creation, 
        test_modal_input_creation,
        test_enums_and_types,
        test_vision_processor_initialization,
        test_audio_processor_initialization,
        test_video_processor_initialization,
        test_cross_modal_fusion,
        test_romanian_cultural_system,
        test_performance_metrics
    ]
    
    results = []
    start_time = time.time()
    
    for i, test_func in enumerate(tests, 1):
        try:
            result = test_func()
            results.append(result)
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"\nTest {i}/{len(tests)}: {status}")
        except Exception as e:
            print(f"\nTest {i}/{len(tests)}: ❌ FAILED - {str(e)}")
            results.append(False)
    
    total_time = time.time() - start_time
    passed = sum(results)
    
    print("\n" + "=" * 60)
    print("🏁 MULTI-MODAL INTEGRATION TEST RESULTS")
    print("=" * 60)
    print(f"✅ Tests passed: {passed}/{len(tests)}")
    print(f"❌ Tests failed: {len(tests) - passed}/{len(tests)}")
    print(f"⏱️ Total time: {total_time:.2f}s")
    print(f"📊 Success rate: {passed/len(tests)*100:.1f}%")
    
    if passed == len(tests):
        print("\n🎉 ALL TESTS PASSED! Multi-modal system integration successful!")
        print("✨ Ready for Todo 12 completion!")
    else:
        print(f"\n⚠️ {len(tests) - passed} test(s) failed. Review components before proceeding.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = run_integration_test()
    if not success:
        exit(1)