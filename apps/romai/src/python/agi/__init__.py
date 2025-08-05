"""
RomAI AGI System - Core Package
===============================

This package contains the core AGI system components for the RomAI platform,
organized by functional domains following Microsoft best practices.

Domains:
- consciousness: Self-awareness and consciousness simulation
- learning: Meta-learning, adaptive systems, and cultural learning
- reasoning: Autonomous and cultural reasoning engines
- memory: Memory architectures and knowledge systems
- orchestration: System coordination and multi-agent orchestration
"""

__version__ = "1.0.0"
__author__ = "RomAI Development Team"

# Core AGI imports
from .consciousness import interfaces, simulation, cultural_engine, self_awareness
from .learning.meta import engine as meta_engine, integration as meta_integration
from .learning.adaptive import enhancement, dynamic_systems
from .reasoning import autonomous_engine, cultural_engine as reasoning_cultural
from .orchestration import system_coordinator, cultural_integration, multi_agent

__all__ = [
    # Consciousness
    "interfaces",
    "simulation", 
    "cultural_engine",
    "self_awareness",
    
    # Meta Learning
    "meta_engine",
    "meta_integration",
    
    # Adaptive Learning
    "enhancement",
    "dynamic_systems",
    
    # Reasoning
    "autonomous_engine",
    "reasoning_cultural",
    
    # Orchestration
    "system_coordinator",
    "cultural_integration",
    "multi_agent"
]
