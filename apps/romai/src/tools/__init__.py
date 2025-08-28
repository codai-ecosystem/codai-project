"""
ROMAI Tools Package - AGI Tool System
====================================

Comprehensive tool system for ROMAI AGI including tool management,
model quantization, real inference, and AGI integration capabilities.

Core Components:
- ToolManager: Execute terminal, filesystem, and code operations safely  
- ModelQuantizer: 4-bit quantization optimized for RTX 3060 Ti
- RealInferenceEngine: Production inference with caching and tool integration
- AGI Integration: Seamless integration with existing AGI architecture

Author: GitHub Copilot AGI Inspector
Date: August 27, 2025  
Status: Production Ready
"""

# Core tool system imports
try:
    from .tool_manager import ToolManager, ToolResult, ToolExecutionError
    TOOL_MANAGER_AVAILABLE = True
except ImportError as e:
    TOOL_MANAGER_AVAILABLE = False
    print(f"ToolManager not available: {e}")

try:
    from .quantization import ModelQuantizer, QuantizationConfig, MemoryStats, RTX3060TiMonitor
    QUANTIZATION_AVAILABLE = True
except ImportError as e:
    QUANTIZATION_AVAILABLE = False
    print(f"Quantization system not available: {e}")

try:
    from .real_inference import RealInferenceEngine, GenerationConfig, InferenceResult, PromptTemplate
    INFERENCE_ENGINE_AVAILABLE = True
except ImportError as e:
    INFERENCE_ENGINE_AVAILABLE = False
    print(f"Inference engine not available: {e}")

# Availability flags
__all__ = [
    # Core classes
    'ToolManager', 'ToolResult', 'ToolExecutionError',
    'ModelQuantizer', 'QuantizationConfig', 'MemoryStats', 'RTX3060TiMonitor',
    'RealInferenceEngine', 'GenerationConfig', 'InferenceResult', 'PromptTemplate',
    
    # Availability flags
    'TOOL_MANAGER_AVAILABLE',
    'QUANTIZATION_AVAILABLE', 
    'INFERENCE_ENGINE_AVAILABLE'
]

# System information
TOOL_SYSTEM_VERSION = "1.0.0"
SUPPORTED_HARDWARE = ["RTX 3060 Ti", "CUDA-compatible GPUs"]
FEATURES = [
    "Safe tool execution with security policies",
    "4-bit model quantization for 8GB VRAM",
    "Real inference with caching and optimization",  
    "AGI architecture integration",
    "Comprehensive monitoring and benchmarking"
]

def get_system_info():
    """Get tool system information."""
    return {
        'version': TOOL_SYSTEM_VERSION,
        'components': {
            'tool_manager': TOOL_MANAGER_AVAILABLE,
            'quantization': QUANTIZATION_AVAILABLE,
            'inference_engine': INFERENCE_ENGINE_AVAILABLE
        },
        'supported_hardware': SUPPORTED_HARDWARE,
        'features': FEATURES,
        'ready': all([TOOL_MANAGER_AVAILABLE, QUANTIZATION_AVAILABLE, INFERENCE_ENGINE_AVAILABLE])
    }

print(f"🔧 ROMAI Tool System v{TOOL_SYSTEM_VERSION} initialized")
print(f"✅ Components: Tool Manager: {TOOL_MANAGER_AVAILABLE}, Quantization: {QUANTIZATION_AVAILABLE}, Inference: {INFERENCE_ENGINE_AVAILABLE}")