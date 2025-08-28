"""
AGI Control Center Package Initialization
=======================================

Provides easy access to all AGI Control Center components and utilities.
This module serves as the main entry point for the AGI system.

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 AGI Implementation
"""

from .agi_control_center import (
    AGIControlCenter,
    ResourceType,
    TaskPriority,
    SystemState,
    PerformanceProfile
)

from .attention_allocation import (
    AttentionAllocationSystem,
    AttentionMode,
    ResourceBudget,
    AttentionRequest,
    ResourceAllocation
)

from .strategic_planning import (
    StrategicPlanningEngine,
    Goal,
    Strategy,
    PlanHorizon,
    StrategyType,
    GoalStatus
)

from .execution_monitor import (
    TaskExecutionMonitor,
    TaskExecution,
    ExecutionStatus,
    AlertSeverity,
    Alert,
    InterventionType,
    PerformanceMetrics
)

from .integration import (
    AGIIntegration,
    ComponentStatus,
    create_agi_system
)

# Version info
__version__ = "1.0.0"
__phase__ = "Phase 1 - Unified Cognitive Architecture"

# Package metadata
__all__ = [
    # Main classes
    "AGIControlCenter",
    "AttentionAllocationSystem", 
    "StrategicPlanningEngine",
    "TaskExecutionMonitor",
    "AGIIntegration",
    
    # Enums and types
    "ResourceType",
    "TaskPriority", 
    "SystemState",
    "PerformanceProfile",
    "AttentionMode",
    "PlanHorizon",
    "StrategyType", 
    "GoalStatus",
    "ExecutionStatus",
    "AlertSeverity",
    "InterventionType",
    
    # Data classes
    "ResourceBudget",
    "AttentionRequest",
    "ResourceAllocation",
    "Goal",
    "Strategy", 
    "TaskExecution",
    "Alert",
    "PerformanceMetrics",
    "ComponentStatus",
    
    # Utility functions
    "create_agi_system"
]

# Quick start function
async def quick_start(config=None):
    """
    Quick start function to initialize and start AGI system
    
    Args:
        config: Optional configuration dictionary
        
    Returns:
        Running AGI system ready for operation
    """
    import logging
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("🚀 Starting AGI Control Center...")
    
    # Create and initialize system
    agi_system = await create_agi_system(config)
    
    # Start autonomous operation
    success = await agi_system.start_system()
    
    if success:
        logger.info("✅ AGI system is now active and operating autonomously")
        return agi_system
    else:
        logger.error("❌ Failed to start AGI system")
        raise RuntimeError("AGI system startup failed")

# Development helpers
def get_version_info():
    """Get version and phase information"""
    return {
        "version": __version__,
        "phase": __phase__,
        "components": [
            "AGI Control Center - Main orchestration system",
            "Attention Allocation - Resource management", 
            "Strategic Planning - Goal decomposition and planning",
            "Execution Monitor - Task tracking and performance",
            "Integration - Component coordination"
        ]
    }

def print_architecture():
    """Print AGI architecture overview"""
    print("""
🧠 ROMAI AGI Control Center Architecture
========================================

┌─────────────────────────────────────────────┐
│            AGI Integration Layer            │
│  • Component coordination                   │ 
│  • Event processing                         │
│  • Health monitoring                        │
└─────────────────────────────────────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼────┐    ┌─────────▼──┐    ┌──────────▼─┐
│  AGI   │    │ Attention  │    │ Strategic  │
│Control │    │Allocation  │    │ Planning   │
│Center  │    │  System    │    │  Engine    │
│        │    │            │    │            │
└────────┘    └────────────┘    └────────────┘
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                ┌───────▼────┐
                │ Execution  │
                │  Monitor   │
                │            │
                └────────────┘

Key Features:
• Autonomous cognitive orchestration
• Resource-aware attention allocation  
• Hierarchical goal decomposition
• Real-time performance monitoring
• Adaptive strategy optimization
• Self-healing and error recovery
""")

# Example usage documentation
USAGE_EXAMPLE = """
# Basic Usage Example:

import asyncio
from romai.agi.control_center import quick_start

async def main():
    # Start AGI system with default configuration
    agi_system = await quick_start()
    
    # Execute high-level command
    result = await agi_system.execute_high_level_command(
        "improve system performance",
        {"focus": "resource_efficiency", "target": 0.85}
    )
    
    print(f"Command result: {result}")
    
    # Get system status
    status = await agi_system.get_system_status()
    print(f"System health: {status['integration_metrics']['component_health']}")
    
    # Let it run autonomously for a while
    await asyncio.sleep(60)  # Run for 1 minute
    
    # Graceful shutdown
    await agi_system.stop_system()

if __name__ == "__main__":
    asyncio.run(main())
"""

def print_usage_example():
    """Print usage example"""
    print(USAGE_EXAMPLE)