"""
RomAI AGI Hardware Integration Module

Integrates hardware optimization directly into the AGI system for automatic
model optimization, memory management, and performance monitoring.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import torch

# Import our hardware optimizer
try:
    from .hardware_optimizer import (
        HardwareOptimizer, 
        HardwareConfig, 
        OptimizationLevel,
        MemoryStrategy,
        get_hardware_optimizer
    )
    HARDWARE_OPTIMIZER_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("🚀 Hardware Optimizer integration loaded successfully")
except ImportError as e:
    HARDWARE_OPTIMIZER_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"Hardware Optimizer not available: {e}")

@dataclass 
class AGIHardwareIntegration:
    """Integration layer between AGI system and hardware optimization"""
    
    def __init__(self):
        self.optimizer = None
        self.optimization_enabled = HARDWARE_OPTIMIZER_AVAILABLE
        self.optimized_components = {}
        self.performance_metrics = {}
        
        if self.optimization_enabled:
            self._initialize_optimizer()
        
        logger.info("🔧 AGI Hardware Integration initialized")
    
    async def initialize(self):
        """Initialize the hardware integration asynchronously"""
        if not self.optimization_enabled:
            logger.warning("Hardware optimization not available")
            return False
        
        try:
            # Perform any async initialization here
            logger.info("⚡ AGI Hardware Integration async initialization completed")
            return True
        except Exception as e:
            logger.error(f"❌ AGI Hardware Integration initialization failed: {e}")
            return False
    
    def _initialize_optimizer(self):
        """Initialize hardware optimizer with RTX 3060 Ti configuration"""
        config = HardwareConfig(
            gpu_vram_gb=8.0,        # RTX 3060 Ti
            cpu_ram_gb=192.0,       # i9-14900K system
            optimization_level=OptimizationLevel.BALANCED,
            memory_strategy=MemoryStrategy.HYBRID_SHARDING,
            enable_mixed_precision=True,
            enable_gradient_checkpointing=True
        )
        
        self.optimizer = get_hardware_optimizer(config)
        logger.info("✅ Hardware optimizer configured for RTX 3060 Ti + i9-14900K")
    
    async def optimize_agi_component(
        self, 
        component_name: str,
        component: Any,
        force_reoptimization: bool = False
    ) -> Any:
        """Optimize an AGI component for local hardware"""
        
        if not self.optimization_enabled:
            logger.warning("Hardware optimization not available")
            return component
        
        # Skip if already optimized unless forced
        if component_name in self.optimized_components and not force_reoptimization:
            logger.info(f"🔄 Using cached optimization for {component_name}")
            return self.optimized_components[component_name]
        
        logger.info(f"🔧 Optimizing AGI component: {component_name}")
        
        try:
            # Check if component has a PyTorch model
            model = None
            if hasattr(component, 'model'):
                model = component.model
            elif isinstance(component, torch.nn.Module):
                model = component
            elif hasattr(component, 'neural_network'):
                model = component.neural_network
            
            if model is not None:
                # Apply hardware optimization
                optimized_model = await self.optimizer.optimize_model_for_hardware(
                    model, component_name
                )
                
                # Update component with optimized model
                if hasattr(component, 'model'):
                    component.model = optimized_model
                elif isinstance(component, torch.nn.Module):
                    component = optimized_model
                elif hasattr(component, 'neural_network'):
                    component.neural_network = optimized_model
                
                logger.info(f"✅ Hardware optimization applied to {component_name}")
            else:
                logger.info(f"ℹ️ No PyTorch model found in {component_name}, skipping optimization")
            
            # Cache optimized component
            self.optimized_components[component_name] = component
            
            # Update performance metrics
            self._update_performance_metrics(component_name)
            
            return component
            
        except Exception as e:
            logger.error(f"❌ Failed to optimize {component_name}: {e}")
            return component
    
    def _update_performance_metrics(self, component_name: str):
        """Update performance metrics for optimized component"""
        if not self.optimizer:
            return
        
        report = self.optimizer.get_optimization_report()
        self.performance_metrics[component_name] = {
            'gpu_utilization': report['current_usage']['gpu_utilization_percent'],
            'efficiency_score': report['efficiency_score'],
            'memory_used_gb': report['current_usage']['gpu_memory_used_gb'],
            'optimization_timestamp': torch.cuda.Event(enable_timing=True) if torch.cuda.is_available() else None
        }
    
    def get_hardware_status(self) -> Dict[str, Any]:
        """Get comprehensive hardware status and optimization report"""
        if not self.optimization_enabled:
            return {
                'status': 'Hardware optimization not available',
                'optimization_enabled': False
            }
        
        base_report = self.optimizer.get_optimization_report()
        
        # Add AGI-specific information
        agi_status = {
            'agi_integration': {
                'optimized_components': list(self.optimized_components.keys()),
                'total_optimized': len(self.optimized_components),
                'performance_metrics': self.performance_metrics
            },
            'hardware_recommendations': self._generate_hardware_recommendations(base_report)
        }
        
        # Merge reports
        base_report.update(agi_status)
        return base_report
    
    def _generate_hardware_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate hardware optimization recommendations"""
        recommendations = []
        
        gpu_utilization = report['current_usage']['gpu_utilization_percent']
        
        if gpu_utilization > 90:
            recommendations.append("⚠️ High GPU utilization detected. Consider more aggressive quantization.")
        elif gpu_utilization < 50:
            recommendations.append("💡 GPU underutilized. You could increase model complexity or batch size.")
        
        if report['efficiency_score'] < 70:
            recommendations.append("🔧 Low efficiency score. Consider adjusting optimization level to AGGRESSIVE.")
        
        if len(self.optimized_components) < 3:
            recommendations.append("📈 Few components optimized. Consider optimizing more AGI components.")
        
        return recommendations
    
    async def optimize_all_agi_components(self, agi_system: Any) -> Any:
        """Automatically optimize all components in an AGI system"""
        if not self.optimization_enabled:
            return agi_system
        
        logger.info("🚀 Starting comprehensive AGI system optimization...")
        
        # List of known AGI components to optimize
        component_mappings = {
            'mathematical_engine': 'mathematical_reasoning',
            'logical_engine': 'logical_reasoning', 
            'neurosymbolic_bridge': 'neurosymbolic_integration',
            'consciousness_framework': 'consciousness_simulation',
            'meta_learning_engine': 'meta_learning',
            'advanced_reasoning': 'advanced_reasoning_system'
        }
        
        for attr_name, component_name in component_mappings.items():
            if hasattr(agi_system, attr_name):
                component = getattr(agi_system, attr_name)
                optimized_component = await self.optimize_agi_component(
                    component_name, component
                )
                setattr(agi_system, attr_name, optimized_component)
        
        logger.info("✅ Comprehensive AGI system optimization completed")
        return agi_system
    
    def enable_memory_monitoring(self):
        """Enable continuous memory monitoring and optimization"""
        if not self.optimization_enabled:
            return
        
        logger.info("📊 Memory monitoring enabled")
        
        # This would typically run in a background task
        # For now, we'll just log the current status
        status = self.get_hardware_status()
        logger.info(f"💾 GPU Memory: {status['current_usage']['gpu_memory_used_gb']:.2f}GB / {status['hardware_config']['gpu_vram_gb']:.2f}GB")
        logger.info(f"📈 Efficiency Score: {status['efficiency_score']:.1f}%")
    
    def clear_optimization_cache(self):
        """Clear all cached optimizations"""
        self.optimized_components.clear()
        self.performance_metrics.clear()
        logger.info("🗑️ Optimization cache cleared")
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        if not self.optimization_enabled:
            return {'error': 'Hardware optimization not available'}
        
        try:
            # Get hardware status
            hardware_status = self.get_hardware_status()
            
            # Get optimization report
            optimization_report = self.optimizer.get_optimization_report()
            
            # Combine metrics
            metrics = {
                'hardware_status': hardware_status,
                'optimization_report': optimization_report,
                'optimized_components': len(self.optimized_components),
                'performance_metrics': self.performance_metrics
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {'error': str(e)}

# Global integration instance
_agi_hardware_integration = None

def get_agi_hardware_integration() -> AGIHardwareIntegration:
    """Get global AGI hardware integration instance"""
    global _agi_hardware_integration
    if _agi_hardware_integration is None:
        _agi_hardware_integration = AGIHardwareIntegration()
    return _agi_hardware_integration

async def apply_hardware_optimization_to_agi(agi_system: Any) -> Any:
    """Main function to apply hardware optimization to an AGI system"""
    integration = get_agi_hardware_integration()
    return await integration.optimize_all_agi_components(agi_system)

def get_hardware_optimization_status() -> Dict[str, Any]:
    """Get current hardware optimization status"""
    integration = get_agi_hardware_integration()
    return integration.get_hardware_status()

if __name__ == "__main__":
    # Test the integration
    integration = AGIHardwareIntegration()
    status = integration.get_hardware_status()
    print("Hardware Status:", status)