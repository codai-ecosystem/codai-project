"""
🌉 Modality Bridge System - Week 8 Day 1 Component 3 Complete

This module provides the main interface for the complete Modality Bridge System,
integrating all bridge components and providing unified access to Romanian
cross-modal AI capabilities.

Key Features:
- Unified interface for all modality bridging operations
- Romanian cultural context preservation across all modalities
- Performance optimization and monitoring
- Quality assurance and validation
- Extensible architecture for future enhancements

Components Included:
- Core bridge infrastructure (bridge_core.py)
- Text-Audio bridging (text_audio_bridge.py) 
- Text-Visual bridging (text_visual_bridge.py)
- Audio-Visual bridging (audio_visual_bridge.py)
- Romanian Modality Adapter (central coordinator)

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union

# Import all bridge components
from .bridge_core import (
    BridgeDirection, RomanianRegion, QualityLevel,
    BridgeRequest, BridgeResult, BridgeMetrics,
    ModalityBridge, RomanianCulturalProcessor,
    validate_romanian_content, estimate_processing_complexity
)

from .text_audio_bridge import (
    TextAudioBridge, RomanianPhoneticProcessor, RomanianProsodyEngine
)

from .text_visual_bridge import (
    TextVisualBridge, RomanianVisualSymbolology, 
    RomanianArtisticStyleProcessor, RomanianColorPaletteGenerator
)

from .audio_visual_bridge import (
    AudioVisualBridge, CrossModalValidator, RomanianModalityAdapter
)

class ModalityBridgeSystem:
    """
    Complete Modality Bridge System for Romanian AI processing.
    
    This is the main interface for accessing all modality bridging capabilities
    with Romanian cultural context preservation and quality assurance.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.adapter = RomanianModalityAdapter()
        self._system_initialized = False
    
    async def initialize(self) -> None:
        """Initialize the complete modality bridge system"""
        self.logger.info("🌉 Initializing Complete Modality Bridge System")
        
        await self.adapter.initialize()
        self._system_initialized = True
        
        self.logger.info("✅ Modality Bridge System initialized successfully")
        self.logger.info("📊 Available bridges: Text↔Audio, Text↔Visual, Audio↔Visual")
        self.logger.info("🇷🇴 Romanian cultural preservation: ENABLED")
    
    async def bridge(self, 
                    source_modality: str,
                    target_modality: str,
                    content: Any,
                    romanian_context: Optional[Dict[str, Any]] = None,
                    region: Optional[RomanianRegion] = None,
                    quality_level: QualityLevel = QualityLevel.HIGH,
                    preserve_culture: bool = True,
                    **kwargs) -> BridgeResult:
        """
        Bridge content between modalities with Romanian cultural preservation.
        
        Args:
            source_modality: Source modality ('text', 'audio', 'visual')
            target_modality: Target modality ('text', 'audio', 'visual')
            content: Content to be bridged
            romanian_context: Romanian cultural context information
            region: Romanian region preference
            quality_level: Processing quality level
            preserve_culture: Whether to preserve Romanian cultural elements
            **kwargs: Additional parameters
            
        Returns:
            Bridge result with converted content and quality metrics
            
        Example:
            >>> system = ModalityBridgeSystem()
            >>> await system.initialize()
            >>> result = await system.bridge(
            ...     source_modality="text",
            ...     target_modality="audio",
            ...     content="Ștefan cel Mare a fost domnitor al Moldovei",
            ...     romanian_context={'content_type': 'historical'},
            ...     region=RomanianRegion.MOLDOVA
            ... )
            >>> print(f"Quality: {result.quality_score:.2f}")
        """
        if not self._system_initialized:
            raise RuntimeError("System not initialized. Call initialize() first.")
        
        # Set default Romanian context if not provided
        if romanian_context is None:
            romanian_context = {'content_type': 'general', 'preserve_authenticity': True}
        
        # Create bridge request
        request = BridgeRequest(
            source_modality=source_modality,
            target_modality=target_modality,
            content=content,
            romanian_context=romanian_context,
            quality_level=quality_level,
            preserve_culture=preserve_culture,
            region_preference=region,
            metadata=kwargs
        )
        
        # Perform bridging
        return await self.adapter.bridge_modalities(request)
    
    async def bridge_chain(self,
                          content: Any,
                          modality_sequence: List[str],
                          romanian_context: Optional[Dict[str, Any]] = None,
                          region: Optional[RomanianRegion] = None,
                          quality_level: QualityLevel = QualityLevel.HIGH,
                          validate_consistency: bool = True,
                          **kwargs) -> List[BridgeResult]:
        """
        Bridge content through a sequence of modalities.
        
        Args:
            content: Initial content
            modality_sequence: Sequence of modalities to bridge through
            romanian_context: Romanian cultural context
            region: Romanian region preference
            quality_level: Processing quality level
            validate_consistency: Whether to validate cross-modal consistency
            **kwargs: Additional parameters
            
        Returns:
            List of bridge results for each step in the sequence
            
        Example:
            >>> results = await system.bridge_chain(
            ...     content="Biserică ortodoxă în Bucovina",
            ...     modality_sequence=['text', 'visual', 'audio'],
            ...     romanian_context={'content_type': 'religious'},
            ...     region=RomanianRegion.BUCOVINA
            ... )
        """
        if not self._system_initialized:
            raise RuntimeError("System not initialized. Call initialize() first.")
        
        # Set default Romanian context if not provided
        if romanian_context is None:
            romanian_context = {'content_type': 'general', 'preserve_authenticity': True}
        
        # Perform bridge chain
        return await self.adapter.bridge_chain(
            content=content,
            modality_chain=modality_sequence,
            romanian_context=romanian_context,
            region_preference=region,
            quality_level=quality_level,
            preserve_culture=True,
            **kwargs
        )
    
    async def validate_content(self, content: Any, modality: str) -> bool:
        """
        Validate if content appears to be Romanian.
        
        Args:
            content: Content to validate
            modality: Modality type ('text', 'audio', 'visual')
            
        Returns:
            True if content appears to be Romanian
        """
        return await validate_romanian_content(content, modality)
    
    async def estimate_complexity(self, 
                                 source_modality: str,
                                 target_modality: str,
                                 content: Any,
                                 quality_level: QualityLevel = QualityLevel.HIGH) -> float:
        """
        Estimate processing complexity for a bridge operation.
        
        Args:
            source_modality: Source modality
            target_modality: Target modality
            content: Content to be processed
            quality_level: Processing quality level
            
        Returns:
            Complexity score (0.0 to 3.0)
        """
        request = BridgeRequest(
            source_modality=source_modality,
            target_modality=target_modality,
            content=content,
            romanian_context={'content_type': 'general'},
            quality_level=quality_level
        )
        
        return await estimate_processing_complexity(request)
    
    async def get_system_status(self) -> Dict[str, Any]:
        """
        Get comprehensive system status and performance metrics.
        
        Returns:
            System status information including bridge health and metrics
        """
        if not self._system_initialized:
            return {'status': 'not_initialized', 'initialized': False}
        
        adapter_status = await self.adapter.get_bridge_status()
        
        return {
            'status': 'operational',
            'initialized': True,
            'system_version': '1.0.0',
            'modality_adapter': adapter_status,
            'supported_modalities': ['text', 'audio', 'visual'],
            'supported_regions': [region.value for region in RomanianRegion],
            'supported_quality_levels': [level.value for level in QualityLevel],
            'features': {
                'cultural_preservation': True,
                'regional_adaptation': True,
                'cross_modal_validation': True,
                'performance_optimization': True
            }
        }
    
    async def optimize_system(self) -> Dict[str, Any]:
        """
        Optimize system performance across all bridges.
        
        Returns:
            Optimization results and recommendations
        """
        if not self._system_initialized:
            raise RuntimeError("System not initialized. Call initialize() first.")
        
        return await self.adapter.optimize_performance()
    
    async def get_cultural_processor(self) -> RomanianCulturalProcessor:
        """Get the Romanian cultural processor for advanced operations"""
        return self.adapter.cultural_processor
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform comprehensive health check of the system.
        
        Returns:
            Health check results
        """
        try:
            status = await self.get_system_status()
            
            if not status['initialized']:
                return {'health': 'unhealthy', 'issue': 'System not initialized'}
            
            # Check each bridge health
            bridge_health = {}
            for bridge_name, bridge_info in status['modality_adapter']['bridges'].items():
                bridge_health[bridge_name] = bridge_info['status']
            
            # Determine overall health
            unhealthy_bridges = [name for name, health in bridge_health.items() if health != 'healthy']
            
            if not unhealthy_bridges:
                overall_health = 'healthy'
                issues = []
            elif len(unhealthy_bridges) == 1:
                overall_health = 'degraded'
                issues = [f"Bridge {unhealthy_bridges[0]} is unhealthy"]
            else:
                overall_health = 'unhealthy'
                issues = [f"Multiple bridges unhealthy: {', '.join(unhealthy_bridges)}"]
            
            return {
                'health': overall_health,
                'bridge_health': bridge_health,
                'issues': issues,
                'global_metrics': status['modality_adapter']['global_metrics']
            }
            
        except Exception as e:
            return {
                'health': 'unhealthy',
                'error': str(e),
                'issues': ['System health check failed']
            }

# Convenience functions for direct access
async def create_bridge_system() -> ModalityBridgeSystem:
    """Create and initialize a new modality bridge system"""
    system = ModalityBridgeSystem()
    await system.initialize()
    return system

async def quick_bridge(source_modality: str,
                      target_modality: str, 
                      content: Any,
                      romanian_context: Optional[Dict[str, Any]] = None) -> BridgeResult:
    """
    Quick bridge operation with automatic system management.
    
    Creates, initializes, and uses a bridge system for a single operation.
    For multiple operations, create a persistent system instead.
    """
    system = await create_bridge_system()
    return await system.bridge(
        source_modality=source_modality,
        target_modality=target_modality,
        content=content,
        romanian_context=romanian_context
    )

# Export all main classes and functions
__all__ = [
    # Main system interface
    'ModalityBridgeSystem',
    'create_bridge_system',
    'quick_bridge',
    
    # Core components
    'BridgeDirection',
    'RomanianRegion', 
    'QualityLevel',
    'BridgeRequest',
    'BridgeResult',
    'BridgeMetrics',
    
    # Bridge implementations
    'TextAudioBridge',
    'TextVisualBridge', 
    'AudioVisualBridge',
    'RomanianModalityAdapter',
    
    # Specialized processors
    'RomanianCulturalProcessor',
    'RomanianPhoneticProcessor',
    'RomanianProsodyEngine',
    'RomanianVisualSymbolology',
    'RomanianArtisticStyleProcessor',
    'RomanianColorPaletteGenerator',
    'CrossModalValidator',
    
    # Utility functions
    'validate_romanian_content',
    'estimate_processing_complexity'
]

# Module level test
if __name__ == "__main__":
    async def test_complete_system():
        print("🌉 Testing Complete Modality Bridge System")
        print("=" * 50)
        
        # Create and initialize system
        system = ModalityBridgeSystem()
        await system.initialize()
        
        # Test single bridge operation
        print("\n📝➡️🔊 Testing Text to Audio:")
        result1 = await system.bridge(
            source_modality="text",
            target_modality="audio",
            content="Ștefan cel Mare și Sfânt a fost un mare domnitor al Moldovei.",
            romanian_context={'content_type': 'historical', 'region': 'moldova'},
            region=RomanianRegion.MOLDOVA
        )
        
        print(f"Quality Score: {result1.quality_score:.2f}")
        print(f"Cultural Preservation: {result1.cultural_preservation_score:.2f}")
        print(f"Processing Time: {result1.processing_time:.3f}s")
        
        # Test bridge chain
        print("\n🔗 Testing Bridge Chain (Text → Visual → Audio):")
        chain_results = await system.bridge_chain(
            content="Biserică ortodoxă cu picturi murale în Transilvania",
            modality_sequence=['text', 'visual', 'audio'],
            romanian_context={'content_type': 'religious'},
            region=RomanianRegion.TRANSILVANIA
        )
        
        for i, result in enumerate(chain_results):
            print(f"Step {i+1}: {result.source_modality} → {result.target_modality}")
            print(f"  Quality: {result.quality_score:.2f}, Cultural: {result.cultural_preservation_score:.2f}")
        
        # Test system status
        print("\n📊 System Status:")
        status = await system.get_system_status()
        print(f"Status: {status['status']}")
        print(f"Global Operations: {status['modality_adapter']['global_metrics']['conversions_performed']}")
        print(f"Success Rate: {status['modality_adapter']['global_metrics']['success_rate']:.2f}")
        
        # Test health check
        print("\n🏥 Health Check:")
        health = await system.health_check()
        print(f"Overall Health: {health['health']}")
        print(f"Issues: {health.get('issues', 'None')}")
        
        print("\n✅ Complete Modality Bridge System test completed successfully!")
    
    # Run the test
    asyncio.run(test_complete_system())
