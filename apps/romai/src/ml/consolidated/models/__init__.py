#!/usr/bin/env python3
"""
ML Models Package
Core machine learning models for RomAI AGI system
Microsoft Azure ML compatible - Enterprise-grade model collection

Comprehensive model library for AGI capabilities including:
- Neural AGI models with transformer architecture
- Multimodal architectures for vision, audio, and text
- Romanian language processing and cultural understanding
"""

from .neural_agi_model import (
    NeuralAGIModel,
    TransformerAGICore,
    AGIPerformanceMetrics,
    create_neural_agi_model
)

from .multimodal_architecture import (
    MultimodalArchitecture,
    RomanianVisionTransformer,
    RomanianAudioTransformer,
    CrossModalAttention,
    create_multimodal_architecture
)

from .romanian_language_model import (
    RomanianLanguageModel,
    RomanianTokenizer,
    RomanianAttention,
    create_romanian_language_model
)

from .real_neural_agi_engine import (
    RealTransformerAGI,
    RealNeuralAGIEngine,
    create_real_neural_agi_engine
)

from .hybrid_architecture import (
    HybridArchitecture,
    RomanianLinguisticAttention,
    ModelConfig,
    create_hybrid_architecture
)

from .consciousness_foundation import (
    GenuineConsciousnessFoundation,
    GenuineConsciousnessMetrics,
    PhenomenalConsciousnessModule,
    MetaCognitiveAwarenessModule,
    WorkingMemoryIntegrationModule,
    create_genuine_consciousness_foundation
)

from .authentic_agi_engine import (
    AuthenticAGIEngine,
    AGICapability,
    AGIPerformanceMetrics,
    create_authentic_agi_engine
)

from .execution_engine import (
    ExecutionEngine,
    ExecutionContext,
    ActionResult,
    ReinforcementLearningActionSelector,
    AdaptiveExecutionMonitor,
    OutcomePredictionNetwork,
    create_execution_engine
)

from .autonomous_agents import (
    MultiAgentOrchestrator,
    AutonomousRomanianAgent,
    RomanianReasoningEngine,
    RomanianAgentType,
    RomanianTask,
    AgentResponse,
    create_autonomous_agents
)

from .mamba_layer import (
    MambaModel,
    MambaLayer,
    MambaBlock,
    SelectiveScanKernel,
    create_mamba_model
)

__all__ = [
    # Neural AGI Models
    'NeuralAGIModel',
    'TransformerAGICore',
    'AGIPerformanceMetrics',
    'create_neural_agi_model',
    
    # Real Neural AGI Engine
    'RealTransformerAGI',
    'RealNeuralAGIEngine', 
    'create_real_neural_agi_engine',
    
    # Hybrid Architecture
    'HybridArchitecture',
    'RomanianLinguisticAttention',
    'ModelConfig',
    'create_hybrid_architecture',
    
    # Consciousness Foundation
    'GenuineConsciousnessFoundation',
    'GenuineConsciousnessMetrics',
    'PhenomenalConsciousnessModule',
    'MetaCognitiveAwarenessModule',
    'WorkingMemoryIntegrationModule',
    'create_genuine_consciousness_foundation',
    
    # Authentic AGI Engine
    'AuthenticAGIEngine',
    'AGICapability',
    'create_authentic_agi_engine',
    
    # Execution Engine
    'ExecutionEngine',
    'ExecutionContext',
    'ActionResult',
    'ReinforcementLearningActionSelector',
    'AdaptiveExecutionMonitor',
    'OutcomePredictionNetwork',
    'create_execution_engine',
    
    # Autonomous Agents
    'MultiAgentOrchestrator',
    'AutonomousRomanianAgent',
    'RomanianReasoningEngine',
    'RomanianAgentType',
    'RomanianTask',
    'AgentResponse',
    'create_autonomous_agents',
    
    # Mamba Models
    'MambaModel',
    'MambaLayer',
    'MambaBlock',
    'SelectiveScanKernel',
    'create_mamba_model',
    
    # Multimodal Architecture
    'MultimodalArchitecture',
    'RomanianVisionTransformer',
    'RomanianAudioTransformer',
    'CrossModalAttention',
    'create_multimodal_architecture',
    
    # Romanian Language Models
    'RomanianLanguageModel',
    'RomanianTokenizer',
    'RomanianAttention',
    'create_romanian_language_model'
]

# Model registry for dynamic loading
MODEL_REGISTRY = {
    'neural_agi': {
        'class': NeuralAGIModel,
        'factory': create_neural_agi_model,
        'description': 'Core neural AGI model with transformer architecture',
        'capabilities': ['reasoning', 'creativity', 'learning', 'consciousness']
    },
    'real_neural_agi': {
        'class': RealNeuralAGIEngine,
        'factory': create_real_neural_agi_engine,
        'description': 'Enterprise-grade real neural AGI with consciousness indicators',
        'capabilities': ['real_intelligence', 'consciousness', 'adaptation', 'meta_cognition']
    },
    'consciousness_foundation': {
        'class': GenuineConsciousnessFoundation,
        'factory': create_genuine_consciousness_foundation,
        'description': 'Genuine consciousness foundation with phenomenal experience, meta-cognition, and working memory',
        'capabilities': ['phenomenal_consciousness', 'meta_cognitive_awareness', 'subjective_experience', 'working_memory_integration', 'consciousness_coherence']
    },
    'authentic_agi': {
        'class': AuthenticAGIEngine,
        'factory': create_authentic_agi_engine,
        'description': 'Authentic AGI engine with genuine performance metrics and zero synthetic inflation',
        'capabilities': ['mathematical_reasoning', 'language_processing', 'problem_solving', 'learning_capability', 'creativity_index', 'logical_reasoning']
    },
    'hybrid_architecture': {
        'class': HybridArchitecture,
        'factory': create_hybrid_architecture,
        'description': 'Revolutionary hybrid Transformer-Mamba architecture',
        'capabilities': ['infinite_context', 'parallel_reasoning', 'romanian_linguistics', 'adaptive_routing']
    },
    'multimodal': {
        'class': MultimodalArchitecture,
        'factory': create_multimodal_architecture,
        'description': 'Multimodal architecture for vision, audio, and text',
        'capabilities': ['vision', 'audio', 'text', 'cross_modal_reasoning']
    },
    'romanian_language': {
        'class': RomanianLanguageModel,
        'factory': create_romanian_language_model,
        'description': 'Specialized Romanian language processing and cultural understanding',
        'capabilities': ['romanian_text', 'cultural_context', 'grammar', 'sentiment']
    },
    'execution_engine': {
        'class': ExecutionEngine,
        'factory': create_execution_engine,
        'description': 'Enterprise execution engine for autonomous capabilities with reinforcement learning',
        'capabilities': ['action_selection', 'execution_monitoring', 'outcome_prediction', 'adaptive_learning', 'autonomous_execution']
    },
    'autonomous_agents': {
        'class': MultiAgentOrchestrator,
        'factory': create_autonomous_agents,
        'description': 'Multi-agent orchestrator for Romanian specialized autonomous agents',
        'capabilities': ['multi_agent_coordination', 'romanian_specialization', 'cultural_understanding', 'task_orchestration', 'agent_selection', 'business_assistance', 'cultural_guidance']
    },
    'mamba_model': {
        'class': MambaModel,
        'factory': create_mamba_model,
        'description': 'Enterprise Mamba model with linear complexity and infinite context length',
        'capabilities': ['linear_complexity', 'infinite_context', 'selective_state_space', 'hardware_optimization', 'long_sequence_modeling']
    }
}

def get_model(model_name: str, config=None):
    """
    Get a model by name from the registry
    
    Args:
        model_name: Name of the model to create
        config: Optional configuration dictionary
        
    Returns:
        Instantiated model
    """
    if model_name not in MODEL_REGISTRY:
        available_models = list(MODEL_REGISTRY.keys())
        raise ValueError(f"Model '{model_name}' not found. Available models: {available_models}")
    
    model_info = MODEL_REGISTRY[model_name]
    return model_info['factory'](config)

def list_models():
    """List all available models and their capabilities"""
    models_info = {}
    for name, info in MODEL_REGISTRY.items():
        models_info[name] = {
            'description': info['description'],
            'capabilities': info['capabilities']
        }
    return models_info

def get_model_info(model_name: str):
    """Get detailed information about a specific model"""
    if model_name not in MODEL_REGISTRY:
        return None
    return MODEL_REGISTRY[model_name]

# Version information
__version__ = "1.0.0"
__author__ = "RomAI Team"
__description__ = "Enterprise-grade ML models for AGI capabilities"
